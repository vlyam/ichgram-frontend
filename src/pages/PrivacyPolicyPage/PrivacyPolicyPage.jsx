import InfoPage from "../../modules/InfoPage/InfoPage";
import Button from "../../shared/components/Button/Button";

const PrivacyPolicyPage = () => {
  return (
    <InfoPage>
      <h1>Privacy Policy</h1>
      <p>Your privacy is important to us. This Privacy Policy outlines how we collect, use, and protect your information when you use Ichgram.</p>

      <h2>Information We Collect</h2>
      <p>We may collect personal information such as your name, email address, and contact information when you create an account. Additionally, we may gather data about your usage of the platform to improve our services.</p>

      <h2>How We Use Your Information</h2>
      <p>Your information helps us enhance your experience on Ichgram, communicate with you about updates, and provide customer support.</p>

      <h2>Data Protection</h2>
      <p>We implement various security measures to protect your personal information from unauthorized access or disclosure.</p>

      <p><br /></p>
      <p><Button to="/signup">← Back</Button></p>

    </InfoPage>
  );
};

export default PrivacyPolicyPage;