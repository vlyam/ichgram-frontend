import { useEffect, useState, useRef } from "react";
import axios from "../../shared/api/axiosInstance";
import { useSearchParams } from "react-router-dom";
import StateBanner from "../../shared/components/StateBanner/StateBanner";
import Button from "../../shared/components/Button/Button";
import Loader from "../../shared/components/Loader/Loader";
import styles from "./Messages.module.css";
import { io } from "socket.io-client";
import { useDispatch, useSelector } from 'react-redux';
import { setConversations, updateConversation, clearUnread, removeConversation } from '../../redux/messages/messages-slice';
import defaultAvatarImage from "../../assets/default_avatar_image.png";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "5001";

function truncateText(text, maxLen = 30) {
    if (!text) return "";
    return text.length > maxLen ? text.slice(0, maxLen) + "…" : text;
}

function timeAgo(dateString) {
    if (!dateString) return "";
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "just now";
    if (diffMin < 60) return `${diffMin} min ago`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH} hour${diffH > 1 ? "s" : ""} ago`;
    const diffD = Math.floor(diffH / 24);
    return `${diffD} day${diffD > 1 ? "s" : ""} ago`;
}

const Messages = () => {
    const dispatch = useDispatch();
    const authUser = useSelector((state) => state.auth.user);
    const myId = authUser?.id || authUser?._id;
    const conversations = useSelector((state) => state.messages.conversations);
    const [selectedConv, setSelectedConv] = useState(null);
    const selectedConvRef = useRef(selectedConv);
    const [searchParams] = useSearchParams();
    const openParam = searchParams.get("open");

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [hasOpenedFromParam, setHasOpenedFromParam] = useState(false);
    useEffect(() => {
        if (!hasOpenedFromParam && openParam && conversations.length > 0) {
            const conv = conversations.find(c => c.conversationId === openParam);
            if (conv) {
                openConversation(conv);
                setHasOpenedFromParam(true);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [openParam, conversations, hasOpenedFromParam]);

    useEffect(() => {
        selectedConvRef.current = selectedConv;
    }, [selectedConv]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const s = io(SOCKET_URL || "/", { auth: { token } });

        s.on("connect", () => {
            if (myId) s.emit("join", myId);
        });

        s.on("receive_message", (msg) => {
            const convId = msg.conversationId;
            const fromId = String(msg.from._id);
            const isFromOtherUser = fromId !== String(myId);

            // Если чат открыт и сообщение не от меня — отмечаем прочитанным
            if (convId === selectedConvRef.current && isFromOtherUser) {
                msg.read = true;
                axios.put(`/api/messages/conversations/${convId}/read`).catch(() => { });
            }

            const otherUser = isFromOtherUser ? msg.from : msg.to;

            const newConversationEntry = {
                conversationId: convId,
                text: msg.text,
                createdAt: msg.createdAt,
                otherUser,
                hasUnread: convId === selectedConvRef.current ? false : true,
            };

            dispatch(updateConversation(newConversationEntry));

            setMessages((prev) => {
                if (convId !== selectedConvRef.current) return prev;
                if (prev.some((m) => m._id === msg._id)) return prev;
                const withoutOptimistic = prev.filter(
                    (m) => !(m._id.startsWith("optimistic-") && m.text === msg.text)
                );
                return [...withoutOptimistic, msg];
            });

            if (convId === selectedConvRef.current) {
                setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
            }
        });

        s.on("messages_read", ({ conversationId, updatedMessages }) => {
            if (conversationId !== selectedConvRef.current) return;
            setMessages((prev) => {
                const updatedIds = new Set(updatedMessages.map(m => m._id));
                return prev.map(m => updatedIds.has(m._id) ? { ...m, read: true } : m);
            });
        });

        s.on("conversation_deleted", ({ conversationId }) => {
            dispatch(removeConversation(conversationId));

            if (selectedConvRef.current === conversationId) {
                setSelectedConv(null);
                setMessages([]);
            }
        });

        socketRef.current = s;

        return () => {
            s.off("receive_message");
            s.off("messages_read");
            s.off("conversation_deleted");
            s.disconnect();
        };
    }, [myId, dispatch]);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await axios.get("/api/messages/conversations");
                dispatch(setConversations(data));
            } catch (err) {
                console.log(err);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
        }
    }, [messages]);

    const openConversation = async (conversation) => {
        setSelectedConv(conversation.conversationId);
        setMessages([]);
        setLoading(true);
        try {
            const { data } = await axios.get(`/api/messages/conversations/${conversation.conversationId}`);
            setMessages(data);

            await axios.put(`/api/messages/conversations/${conversation.conversationId}/read`);

            // Сбрасываем флаг непрочитанности в Redux для этого разговора
            dispatch(clearUnread(conversation.conversationId));

        } catch (err) {
            console.error('Error in openConversation:', err);
        } finally {
            setLoading(false);
        }
    };


    const handleSend = async () => {
        if (!input.trim() || !selectedConv || !myId) return;
        const conv = conversations.find(c => c.conversationId === selectedConv);
        if (!conv) return;

        const to = conv.otherUser._id || conv.otherUser.id; // получаем id собеседника

        const payload = {
            to,
            text: input.trim(),
            conversationId: selectedConv, // передаём conversationId
        };

        const optimistic = {
            _id: `optimistic-${Date.now()}`,
            conversationId: selectedConv,
            from: {
                _id: myId,
                username: authUser?.username || "You",
                profile_image: authUser?.profile_image || null,
            },
            to,
            text: input.trim(),
            createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, optimistic]);
        setInput("");
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

        if (socketRef.current?.connected) {
            socketRef.current.emit("send_message", payload);
        } else {
            try {
                await axios.post("/api/messages", payload);
            } catch (err) {
                console.error(err);
            }
        }
    };

    const renderLastMessageInfo = (conv) => {
        if (!conv.createdAt) return "";
        const lastIsMine = String(conv.otherUser._id) !== String(myId);
        if (conv.text) {
            if (lastIsMine) {
                return `${truncateText(conv.text)} · ${timeAgo(conv.createdAt)}`;
            }
            return `You sent a message · ${timeAgo(conv.createdAt)}`;
        }
        return "";
    };

    return (
        <div className={styles.messages}>
            <div className={styles.messages__navigation}>
                <div className={styles.messages__title}>{authUser?.username || "itcareerhub"}</div>

                <div className={styles["messages__navigation-list"]}>
                    {conversations.length === 0 ? (
                        <StateBanner
                            emptyState
                            title="No dialogues"
                            subtitle="Find users and start a dialogue in the profile"
                        />
                    ) : (
                        conversations.map((conv) => {
                            const isActive = selectedConv === conv.conversationId;
                            const buttonClasses = [styles["messages-navigation-button"]];
                            if (isActive) buttonClasses.push(styles.active);
                            if (conv.hasUnread) {
                                buttonClasses.push(styles["messages-navigation-button--has-unread"]);
                            }

                            return (
                                <div key={conv.conversationId} className={styles["messages__navigation-list-element"]}>
                                    <button
                                        className={buttonClasses.join(" ")}
                                        onClick={() => openConversation(conv)}
                                    >
                                        <div className={styles["messages-navigation-button__avatar"]}>
                                            <img
                                                className={styles["messages__avatar-image"]}
                                                src={conv.otherUser.profile_image || defaultAvatarImage}
                                                alt=""
                                            />
                                        </div>
                                        <div className={styles["messages-navigation-button__information"]}>
                                            <div className={styles["messages-navigation-button__title"]}>
                                                {conv.otherUser.username}
                                            </div>
                                            <div className={styles["messages-navigation-button__subtitle"]}>
                                                {renderLastMessageInfo(conv)}
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <div className={styles.messages__content}>
                {!selectedConv ? (
                    <div className={styles["messages__empty-pane"]}>
                        <StateBanner emptyState title="No conversation selected" subtitle="Choose a chat on the left" />
                    </div>
                ) : loading ? (
                    <div className={styles["messages__loading"]}>
                        <Loader />
                    </div>
                ) : (
                    <>
                        <div className={styles.messages__head}>
                            <div className={styles["messages__head-avatar"]}>
                                <img
                                    className={styles["messages__avatar-image"]}
                                    src={
                                        conversations.find((c) => c.conversationId === selectedConv)?.otherUser?.profile_image ||
                                        defaultAvatarImage
                                    }
                                    alt=""
                                />
                            </div>
                            <div className={styles["messages__head-title"]}>
                                {conversations.find((c) => c.conversationId === selectedConv)?.otherUser?.username}
                            </div>
                            <div className={styles["messages__head-remove-chat-button"]}>
                                <Button
                                    onClick={async () => {
                                        if (!selectedConv) return;
                                        if (window.confirm("Are you sure you want to delete this chat and all its messages?")) {
                                            try {
                                                await axios.delete(`/api/messages/conversations/${selectedConv}`);
                                                dispatch(setConversations(
                                                    conversations.filter(c => c.conversationId !== selectedConv)
                                                ));
                                                setSelectedConv(null);
                                                setMessages([]);
                                            } catch (e) {
                                                console.error(e);
                                                alert("Failed to delete chat");
                                            }
                                        }
                                    }}
                                >
                                    Remove chat
                                </Button>
                            </div>
                        </div>

                        <div className={styles.messages__user}>
                            <div className={styles["messages__user-avatar"]}>
                                <img
                                    className={styles["messages__avatar-image"]}
                                    src={
                                        conversations.find((c) => c.conversationId === selectedConv)?.otherUser?.profile_image ||
                                        defaultAvatarImage
                                    }
                                    alt=""
                                />
                            </div>
                            <div className={styles["messages__user-information"]}>
                                <div className={styles["messages__user-title"]}>
                                    {conversations.find((c) => c.conversationId === selectedConv)?.otherUser?.username}
                                </div>
                                <div className={styles["messages__user-subtitle"]}>
                                    {conversations.find((c) => c.conversationId === selectedConv)?.otherUser?.fullname}
                                </div>
                            </div>
                            <Button to={`/profile/${conversations.find((c) => c.conversationId === selectedConv)?.otherUser._id}`}>
                                View profile
                            </Button>
                        </div>

                        <div className={styles.messages__messages}>
                            <div className={styles["messages__datestack"]}>
                                <div className={styles["messages__datetime"]}>
                                    {messages.length > 0
                                        ? new Date(messages[0].createdAt).toLocaleString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })
                                        : ""}
                                </div>
                                <div className={styles["messages__list"]}>
                                    {messages.map((m, idx) => {
                                        const fromId = m.from?._id || m.from;
                                        const isMine = String(fromId) === String(myId);
                                        const messageWrapperClasses = [styles["messages__list-element"]];
                                        const messageClasses = [styles["message"]];
                                        if (isMine) {
                                            messageClasses.push(styles["message--right"]);
                                            if (!m.read) {
                                                messageClasses.push(styles["message--unread"]);
                                            }
                                        } else {
                                            messageClasses.push(styles["message--left"]);

                                        }
                                        console.log('Message read:', m.read, 'Text:', m.text);
                                        return (
                                            <div key={m._id || `${idx}-${m.createdAt}`} className={messageWrapperClasses.join(" ")}>
                                                <div className={messageClasses.join(" ")}>
                                                    <div className={styles["message__avatar"]}>
                                                        <img
                                                            className={styles["messages__avatar-image"]}
                                                            src={m.from?.profile_image || defaultAvatarImage}
                                                            alt=""
                                                        />
                                                    </div>
                                                    <div className={styles["message__message"]}>{m.text}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>
                            </div>
                        </div>

                        <div className={styles.messages__form}>
                            <input
                                className={styles.messages__input}
                                type="text"
                                placeholder="Write message"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSend();
                                }}
                            />
                            <Button onClick={handleSend}>Send</Button>
                        </div>
                    </>
                )}

            </div>
        </div>
    );
};

export default Messages;
