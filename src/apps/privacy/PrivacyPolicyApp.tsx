import FullWidthPage from "../../layouts/FullWidthPage/FullWidthPage"
import "./PrivacyPolicyApp.scss"

export function PrivacyPolicyApp() {
    return <FullWidthPage
        title="Privacy Policy"
    >
        <div className="container">
            <p><strong>Effective Date:</strong> Jan 4, 2025</p>

            <p>This privacy policy explains how we collect, use, and protect your personal data when you visit our website and interact with our adoption services.</p>

            <div className="section">
                <h2>1. What Types of Personal Data We Collect</h2>
                <p>We collect the following personal data from adopters for the purpose of managing adoption appointments and processes:</p>
                <ul>
                    <li className="no-bullet"><strong>Personal Identification Information:</strong>
                        <ul>
                            <li>First and last name</li>
                            <li>Phone number</li>
                            <li>Primary email address</li>
                            <li>Secondary email address</li>
                            <li>City and state of residence</li>
                        </ul>
                    </li>

                    <li className="no-bullet"><strong>Household and Pet Information:</strong>
                        <ul>
                            <li>Whether the adopter rents or owns their home, or lives with parents</li>
                            <li>Whether the adopter has a fenced yard</li>
                            <li>Whether the adopter requires mobility assistance during the appointment</li>
                            <li>Whether the adopter has dogs, cats, or other pets at home (and the types of pets)</li>
                            <li>Whether the adopter plans to bring a current dog to the appointment</li>
                        </ul>
                    </li>

                    <li className="no-bullet"><strong>Adoption-Related Information:</strong>
                        <ul>
                            <li>The name of the dog they decide to adopt</li>
                            <li>Approval status for adoption</li>
                            <li>Date of adoption approval</li>
                            <li>Preferences for a dog’s weight, gender, age range, activity level, and shedding level</li>
                            <li>Appointment booking history (including appointments made, canceled, or rescheduled)</li>
                            <li>Notes provided by the adopter for the appointment</li>
                            <li>Shelterluv database ID and application ID (for system integration)</li>
                        </ul>
                    </li>
                </ul>
                <p>We collect this information to ensure a smooth and personalized adoption process, including scheduling appointments, matching adopters with appropriate dogs, and managing their adoption history.</p>
            </div>

            <div className="section">
                <h2>2. Why We Collect Your Personal Data</h2>
                <p>We collect and process your personal data for the following purposes:</p>
                <ul>
                    <li className="no-bullet m10"><strong>To schedule appointments</strong> for adopters to meet with dogs at our shelter.</li>
                    <li className="no-bullet m10"><strong>To match adopters with suitable dogs</strong> based on preferences such as weight, gender, age range, activity level, and shedding level.</li>
                    <li className="no-bullet m10"><strong>To track and manage appointment history,</strong> including bookings, cancellations, and rescheduling.</li>
                    <li className="no-bullet m10"><strong>To facilitate communication</strong> with adopters regarding appointments, dog availability, adoption status, and shelter updates.</li>
                    <li className="no-bullet m10"><strong>To manage the "chosen" status of dogs</strong> that have been selected for adoption but require additional veterinary care before being cleared to go home.</li>
                    <li className="no-bullet m10"><strong>To provide customer support</strong> and assistance during the adoption process.</li>
                    <li className="no-bullet m10"><strong>To comply with our organizational requirements</strong> in managing adoption-related processes and maintaining records.</li>
                </ul>
            </div>

            <div className="section">
                <h2>3. Legal Basis for Processing Personal Data</h2>
                <p>We process your personal data based on the following legal bases under the GDPR:</p>
                <ul>
                    <li className="no-bullet m10"><strong>Consent:</strong> We may ask for your consent to collect and use your data for certain purposes, such as scheduling appointments or receiving communications related to the adoption process. You may withdraw your consent at any time.</li>
                    <li className="no-bullet m10"><strong>Contractual Necessity:</strong> We process your data as necessary to fulfill the contract between you and our shelter. For example, your data is required to schedule appointments, track adoption preferences, and communicate with you about your adoption process.</li>
                    <li className="no-bullet m10"><strong>Legitimate Interests:</strong> We process certain data based on our legitimate interest in managing adoption-related activities and providing the best service to both adopters and dogs. This includes tracking the "chosen" status of dogs requiring additional care or follow-up appointments.</li>
                </ul>
            </div>

            <div className="section">
                <h2>4. Do We Share Your Personal Data?</h2>
                <p>We do not share your personal data with any third parties. All data you provide is used solely for the purposes outlined in this privacy policy and is kept within our organization.</p>
            </div>

            <div className="section">
                <h2>5. Data Transfers Outside the EEA</h2>
                <p>We do not transfer your personal data outside the European Economic Area (EEA). All data is stored and processed within the United States.</p>
            </div>

            <div className="section">
                <h2>6. How Long Do We Keep Your Personal Data?</h2>
                <p>We retain your personal data indefinitely to track adopter status and ensure we can verify if more than a year has passed since your adoption approval. This is necessary for managing the adoption process and meeting our organizational requirements.</p>
                <p>If you request that your data be erased, we will honor your request unless there is a legitimate reason to retain it.</p>
            </div>

            <div className="section">
                <h2>7. Your Rights Over Your Personal Data</h2>
                <p>Under GDPR, you have the following rights regarding your personal data:</p>
                <ul>
                    <li className="no-bullet m10"><strong>The Right to Access:</strong> You can request access to the personal data we hold about you.</li>
                    <li className="no-bullet m10"><strong>The Right to Rectification:</strong> You can request corrections to any inaccurate or incomplete data.</li>
                    <li className="no-bullet"><strong>The Right to Erasure:</strong> You can request the deletion of your data, unless we have a legitimate reason to retain it.</li>
                    <li className="no-bullet m10"><strong>The Right to Restrict Processing:</strong> You can request that we limit how we process your data.</li>
                    <li className="no-bullet m10"><strong>The Right to Data Portability:</strong> You can request a copy of your data in a structured, commonly used format to transfer it to another organization.</li>
                </ul>
                <p>To exercise any of these rights, please contact us at <strong>adoptions@savinggracenc.org</strong>.</p>
            </div>

            <div className="section">
                <h2>8. How to Contact Us</h2>
                <p>If you have any questions or concerns about how we process your personal data, or if you'd like to exercise any of your rights, please contact us at <strong>adoptions@savinggracenc.org</strong>.</p>
            </div>

            <div className="section">
                <h2>9. Cookies and Tracking Technologies</h2>
                <p>We use cookies and similar tracking technologies to enhance your experience on our website and ensure it functions properly. These cookies are essential for providing core functionality, such as managing appointment bookings and maintaining session information. As such, you may not be able to use certain features of the website if you disable these cookies.</p>
                <p>We may also use non-essential cookies for analytics or other purposes, but you are not required to accept these cookies to use the core features of our website.</p>
            </div>

            <div className="section">
                <h2>10. Updates to This Privacy Policy</h2>
                <p>We may update this privacy policy from time to time to reflect changes in our practices or legal requirements. Any updates will be posted on this page, and the date of the most recent revision will be indicated at the top of the page.</p>
                <p>Please review this policy periodically to stay informed about how we protect your data.</p>
            </div>
        </div>
    </FullWidthPage>
}