import InfoPage from "../../modules/InfoPage/InfoPage";
import Button from "../../shared/components/Button/Button";

const CookiesPolicyPage = () => {
  return (
    <InfoPage>
      <h1>Cookies Policy</h1>
      <p>This Cookies Policy explains how Ichgram uses cookies and similar technologies to enhance your experience on our platform.</p>

      <h2>What Are Cookies?</h2>
      <p>Cookies are small text files stored on your device when you visit a website. They help us recognize your device and remember certain information about your preferences.</p>

      <h2>How We Use Cookies</h2>
      <p>We use cookies to improve site functionality, analyze site traffic, and personalize content. You can manage your cookie preferences through your browser settings.</p>

      <h2>Your Consent</h2>
      <p>By using Ichgram, you consent to our use of cookies in accordance with this policy. You can withdraw your consent at any time by adjusting your browser settings.</p>
      <p><br /></p>
      <p><Button to="/signup">← Back</Button></p>

    </InfoPage>
  );
};

export default CookiesPolicyPage;