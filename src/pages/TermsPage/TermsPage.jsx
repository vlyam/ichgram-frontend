import InfoPage from "../../modules/InfoPage/InfoPage";
import Button from "../../shared/components/Button/Button";

const TermsPage = () => {
  return (
    <InfoPage>
      <h1>Terms of Service</h1>
      <p>Welcome to Ichgram! By using our services, you agree to comply with the following terms and conditions. Please read them carefully before using our platform.</p>

      <h2>Acceptance of Terms</h2>
      <p>By accessing or using Ichgram, you acknowledge that you have read, understood, and agree to be bound by these terms.</p>

      <h2>User Responsibilities</h2>
      <p>Users are responsible for their own content and interactions on the platform. You agree not to upload any content that is illegal, harmful, or violates the rights of others.</p>

      <h2>Modification of Terms</h2>
      <p>We reserve the right to modify these terms at any time. Any changes will be effective immediately upon posting on our site.</p>
      <p><br /></p>
      <p><Button to="/signup">← Back</Button></p>
    </InfoPage>
  );
};

export default TermsPage;