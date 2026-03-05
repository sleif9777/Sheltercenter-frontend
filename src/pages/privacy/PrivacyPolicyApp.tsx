import { ReactNode } from "react"

import FullWidthPage from "../../layouts/FullWidthPage/FullWidthPage"

interface PolicySectionProps {
	title: string
	children: ReactNode
}

function PolicySection({ title, children }: PolicySectionProps) {
	return (
		<section className="flex flex-col gap-y-2 border-t border-pink-700 py-1.5">
			<h2 className="text-xl font-semibold text-pink-700">{title}</h2>
			<div className="flex flex-col gap-y-2">{children}</div>
		</section>
	)
}

interface PolicyListProps {
	items: (string | ReactNode)[]
	bulletStyle?: "circle" | "disc" | "none"
	className?: string
}

function PolicyList({ items, bulletStyle = "circle", className }: PolicyListProps) {
	const listClass =
		bulletStyle === "circle"
			? "!list-[circle] marker:text-pink-700 marker:text-base ml-5 space-y-1"
			: bulletStyle === "disc"
				? "list-disc marker:text-pink-700 marker:text-base ml-5 space-y-1"
				: "list-none ml-0 space-y-1"

	return (
		<ul className={`${listClass} ${className ?? ""}`}>
			{items.map((item, i) => (
				<li key={i}>{item}</li>
			))}
		</ul>
	)
}

export function PrivacyPolicyApp() {
	return (
		<FullWidthPage title="Privacy Policy">
			<div className="prose prose-pink mx-5 mt-3 max-w-none border-t border-pink-700 py-2 text-left">
				<p>
					<strong>Effective Date:</strong> Mar 25, 2026
				</p>

				<p className="pb-1.5">
					This privacy policy explains how we collect, use, and protect your personal data when you visit our website and
					interact with our adoption services.
				</p>

				<PolicySection title="1. What Types of Personal Data We Collect">
					<p>
						We collect the following personal data from adopters for the purpose of managing adoption appointments and
						processes:
					</p>

					<PolicyList
						items={[
							<>
								<strong>Personal Identification Information:</strong>
								<PolicyList
									items={[
										"First and last name",
										"Phone number",
										"Primary email address",
										"Secondary email address",
										"Street address of residence",
										"City, state/province, postal code of residence",
									]}
								/>
							</>,
							<>
								<strong>Household and Pet Information:</strong>
								<PolicyList
									items={[
										"Whether the adopter rents or owns their home, or lives with parents",
										"Whether the adopter has a fenced yard",
										"Whether the adopter requires mobility assistance during the appointment",
										"Whether the adopter has dogs, cats, or other pets at home",
										"Whether the adopter plans to bring a current dog to the appointment",
									]}
								/>
							</>,
							<>
								<strong>Adoption-Related Information:</strong>
								<PolicyList
									items={[
										"The name of the dog they decide to adopt",
										"Approval status for adoption",
										"Date of adoption approval",
										"Preferences for a dog’s weight, gender, age range, activity level, and shedding level",
										"Appointment booking history (including appointments made, canceled, or rescheduled)",
										"Notes provided by the adopter for the appointment",
										"Shelterluv database ID and application ID",
									]}
								/>
							</>,
						]}
					/>
					<p>We collect this information to ensure a smooth and personalized adoption process.</p>
				</PolicySection>

				<PolicySection title="2. Why We Collect Your Personal Data">
					<p>We collect and process your personal data for the following purposes:</p>
					<PolicyList
						items={[
							"To schedule appointments for adopters to meet with dogs at our shelter",
							"To match adopters with suitable dogs based on preferences",
							"To track and manage appointment history, including bookings, cancellations, and rescheduling",
							"To facilitate communication with adopters regarding appointments, dog availability, adoption status, and shelter updates",
							'To manage the "chosen" status of dogs that require additional veterinary care',
							"To provide customer support and assistance during the adoption process",
							"To comply with our organizational requirements for adoption records",
						]}
					/>
				</PolicySection>

				<PolicySection title="3. Legal Basis for Processing Personal Data">
					<p>We process your personal data based on the following legal bases under GDPR:</p>
					<PolicyList
						items={[
							<>
								<strong>Consent:</strong> We may ask for your consent to collect and use your data for certain purposes.
							</>,
							<>
								<strong>Contractual Necessity:</strong> We process your data as necessary to fulfill the contract between you
								and our shelter.
							</>,
							<>
								<strong>Legitimate Interests:</strong> We process certain data based on our legitimate interest in managing
								adoption-related activities and providing the best service.
							</>,
						]}
					/>
				</PolicySection>

				<PolicySection title="4. Do We Share Your Personal Data?">
					<p>
						We do not share the personal data saved in this website with any third parties. Data from your original Shelterluv
						application is shared with Boehringer Ingelheim.
					</p>
				</PolicySection>

				<PolicySection title="5. Data Transfers Outside the EEA">
					<p>
						We do not transfer your personal data outside the European Economic Area (EEA). All data is stored and processed
						within the United States.
					</p>
				</PolicySection>

				<PolicySection title="6. How Long Do We Keep Your Personal Data?">
					<p>
						We retain your personal data indefinitely to track adopter status and ensure we can verify if more than a year has
						passed since your adoption approval.
					</p>
					<p>
						If you request that your data be erased, we will honor your request unless there is a legitimate reason to retain
						it.
					</p>
				</PolicySection>

				<PolicySection title="7. Your Rights Over Your Personal Data">
					<p>Under GDPR, you have the following rights regarding your personal data:</p>
					<PolicyList
						items={[
							"The Right to Access: You can request access to the personal data we hold about you",
							"The Right to Rectification: You can request corrections to inaccurate or incomplete data",
							"The Right to Erasure: You can request deletion of your data unless we have a legitimate reason to retain it",
							"The Right to Restrict Processing: You can request that we limit how we process your data",
							"The Right to Data Portability: You can request a copy of your data in a structured format to transfer it elsewhere",
						]}
					/>
					<p>
						To exercise any of these rights, please contact us at <strong>adoptions@savinggracenc.org</strong> and mention the
						Privacy Policy section of the scheduling website.
					</p>
				</PolicySection>

				<PolicySection title="8. How to Contact Us">
					<p>
						If you have any questions or concerns about how we process your personal data, please contact us at{" "}
						<strong>adoptions@savinggracenc.org</strong>.
					</p>
				</PolicySection>

				<PolicySection title="9. Cookies and Tracking Technologies">
					<p>
						We use cookies and similar tracking technologies to enhance your experience on our website and ensure it functions
						properly. Essential cookies are required for core functionality, such as managing appointment bookings and
						maintaining session information. Non-essential cookies are optional.
					</p>
				</PolicySection>

				<PolicySection title="10. Updates to This Privacy Policy">
					<p>
						We may update this privacy policy from time to time to reflect changes in our practices or legal requirements.
						Updates will be posted on this page with the date of the most recent revision.
					</p>
					<p>Please review this policy periodically to stay informed about how we protect your data.</p>
				</PolicySection>
			</div>
		</FullWidthPage>
	)
}
