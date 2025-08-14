import { useEffect, useState, useRef } from "react";
import Form from "../Form/Form";
import Button from "../../shared/components/Button/Button";
import axios from "../../shared/api/axiosInstance";
import { useDispatch } from "react-redux";
import { setUser as setUserRedux } from "../../redux/auth/auth-slice";
import Loader from "../../shared/components/Loader/Loader";
import defaultAvatarImage from "../../assets/default_avatar_image.png";
import styles from "./EditProfile.module.css";

const EditProfile = () => {
    const dispatch = useDispatch();
    const [user, setUserLocal] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchProfile = async () => {
            const { data } = await axios.get("/api/users/profile");
            setUserLocal(data);
        };
        fetchProfile();
    }, []);

    if (!user) return <div className={styles["edit-profile"]}><Loader /></div>;

    const defaultValues = {
        username: user.username || "",
        fullname: user.fullname || "",
        website: user.website || "",
        about: user.bio || "",
    };

    const handleNewPhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("image", file);

        try {
            // Загружаем картинку
            const { data } = await axios.post("/api/upload/image", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            // Обновляем профиль на сервере
            const { data: updatedUser } = await axios.patch("/api/users/profile", {
                username: user.username,
                fullname: user.fullname,
                website: user.website,
                bio: user.bio,
                profile_image: data.image, // base64
            });

            // Обновляем локально и в Redux
            setUserLocal(updatedUser);
            dispatch(setUserRedux(updatedUser));
        } catch (err) {
            console.error("Upload error", err);
        } finally {
            e.target.value = "";
        }
    };

    return (
        <div className={styles["edit-profile"]}>
            <div className={styles["edit-profile__title"]}>Edit profile</div>

            <div className={styles["edit-profile__preview"]}>
                <div className={styles["edit-profile__preview-avatar"]}>
                    <img
                        className={styles["edit-profile__preview-avatar-image"]}
                        src={user.profile_image || defaultAvatarImage}
                        alt=""
                    />
                </div>
                <div className={styles["edit-profile__preview-text"]}>
                    <div className={styles["edit-profile__preview-title"]}>
                        {user.username}
                    </div>
                    {user.fullname && (
                        <div className={styles["edit-profile__preview-fullname"]}>
                            {user.fullname}
                        </div>
                    )}
                    <div className={styles["edit-profile__preview-about"]}>
                        {user.bio}
                    </div>
                </div>
                <Button accentColor onClick={handleNewPhotoClick}>
                    New photo
                </Button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                />
            </div>

            <Form
                profileTheme
                buttonAutoWidth
                disableFieldsAfterSubmit={false}
                fields={[
                    {
                        name: "username",
                        type: "text",
                        placeholder: "Username",
                        label: "Username",
                        required: true,
                    },
                    {
                        name: "fullname",
                        type: "text",
                        placeholder: "Full name",
                        label: "Full name",
                        required: true,
                    },
                    {
                        name: "website",
                        type: "text",
                        placeholder: "Website",
                        label: "Website",
                        link: true,
                    },
                    {
                        name: "about",
                        type: "textarea",
                        placeholder: "About",
                        label: "About",
                    },
                ]}
                buttonText="Save"
                defaultValues={defaultValues}
                onSuccess={async (formData) => {
                    await axios.patch("/api/users/profile", {
                        username: formData.username,
                        fullname: formData.fullname,
                        website: formData.website,
                        bio: formData.about,
                        profile_image: user.profile_image,
                    });

                    const { data } = await axios.get("/api/users/profile");
                    setUserLocal(data);
                    dispatch(setUserRedux(data));
                }}
                successText="Profile successfully updated"
            />

            <hr className={styles["edit-profile__divider"]} />

            <div className={styles["edit-profile__change-password"]}>
                <h3>Change the password</h3>
                <Form
                    profileTheme
                    buttonAutoWidth
                    successText="Password successfully changed"
                    fields={[
                        {
                            name: "currentPassword",
                            type: "password",
                            placeholder: "Current password",
                            label: "Current password",
                            required: true,
                        },
                        {
                            name: "newPassword",
                            type: "password",
                            placeholder: "New password",
                            label: "New password",
                            required: true,
                        },
                        {
                            name: "repeatNewPassword",
                            type: "password",
                            placeholder: "Repeat new password",
                            label: "Repeat new password",
                            required: true,
                        },
                    ]}
                    buttonText="Change password"
                    onSuccess={async (formData, { setError }) => {
                        if (formData.newPassword !== formData.repeatNewPassword) {
                            setError("repeatNewPassword", {
                                type: "manual",
                                message: "Passwords do not match",
                            });
                            throw { message: "Please correct the errors and try again." };
                        }

                        try {
                            await axios.post("/api/users/change-password", {
                                currentPassword: formData.currentPassword,
                                newPassword: formData.newPassword,
                            });
                        } catch (error) {
                            if (error.response?.data?.fieldErrors) {
                                throw {
                                    message: "Please correct the errors and try again.",
                                    fieldErrors: error.response.data.fieldErrors,
                                };
                            }
                            throw error;
                        }
                    }}
                />
            </div>

            <hr className={styles["edit-profile__divider"]} />

            <div className={styles["edit-profile__remove-profile"]}>
                <Button
                    dangerColor
                    onClick={async () => {
                        const confirmed = window.confirm(
                            "Are you sure you want to remove your profile? This action cannot be undone."
                        );
                        if (!confirmed) return;

                        try {
                            await axios.delete("/api/users/profile"); // удаление на бэке
                            // Очистка Redux и токена
                            dispatch(setUserRedux(null));
                            localStorage.removeItem("token");
                            // Редирект на главную или страницу логина
                            window.location.href = "/login";
                        } catch (err) {
                            console.error("Failed to delete profile", err);
                            alert("Failed to delete profile. Please try again later.");
                        }
                    }}
                >
                    Remove profile
                </Button>

            </div>
        </div>
    );
};

export default EditProfile;
