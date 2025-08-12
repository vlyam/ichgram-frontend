import InfoPage from "../../modules/InfoPage/InfoPage";
import Button from "../../shared/components/Button/Button";

const LearnMorePage = () => {
  return (
    <InfoPage>
      <h1>Learn More About Ichgram</h1>
      <p>Ichgram is a social media platform designed to connect people through the sharing of photos and videos. Our goal is to create a vibrant community where users can express themselves, discover new content, and interact with friends and followers.</p>
      <p>By using Ichgram, you can easily share your moments, follow your favorite creators, and explore a wide range of content tailored to your interests. We prioritize user experience and strive to keep our platform safe and enjoyable for everyone.</p>
      <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
      <p><br /></p>
      <p><Button to="/signup">← Back</Button></p>
    </InfoPage>
  );
};

export default LearnMorePage;