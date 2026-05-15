export default function TermsPage() {
  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '4rem 1.5rem', fontFamily: 'Inter, sans-serif', color: '#0E1B2C', lineHeight: 1.7 }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 8 }}>Terms of Service</h1>
      <p style={{ color: '#666', marginBottom: 40 }}>Last updated: May 2026</p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 12 }}>1. Subscription & Billing</h2>
        <p>Tour Agent is offered as a monthly subscription. Your subscription begins on the date of payment and renews automatically each month. You authorise us to charge your payment method on a recurring monthly basis.</p>
        <p style={{ marginTop: 12 }}>You may cancel your subscription at any time. Cancellation takes effect at the end of your current billing period — you retain full access until that date and will not be charged again after cancellation.</p>
        <p style={{ marginTop: 12 }}>No refunds are issued for partial months.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 12 }}>2. AI Service Disclaimer</h2>
        <p>Tour Agent uses artificial intelligence (AI) technology to handle phone calls, answer customer enquiries, and capture leads on your behalf. By subscribing, you acknowledge and agree to the following:</p>
        <ul style={{ marginTop: 12, paddingLeft: 24 }}>
          <li style={{ marginBottom: 8 }}>The AI may occasionally provide inaccurate, incomplete, or outdated information to callers. It is not infallible.</li>
          <li style={{ marginBottom: 8 }}>The AI requires an initial training period during which its responses may not fully reflect your specific tours, pricing, or policies. You are responsible for reviewing and correcting its configuration during this period.</li>
          <li style={{ marginBottom: 8 }}>Tour Agent is not liable for any missed bookings, lost revenue, or customer dissatisfaction resulting from AI errors.</li>
          <li style={{ marginBottom: 8 }}>You are responsible for ensuring that the information provided to train the AI (FAQ, pricing, tour details) is accurate and up to date.</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 12 }}>3. Acceptable Use</h2>
        <p>You agree to use Tour Agent only for legitimate business purposes — specifically, handling inbound phone enquiries for your tourism operation. You must not use the service to mislead callers, violate applicable laws, or engage in any fraudulent activity.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 12 }}>4. Data & Privacy</h2>
        <p>Call recordings, transcripts, and lead data are stored securely and accessible only to you via your dashboard. We do not sell your data or your customers' data to third parties. Data is retained for 12 months and may be deleted on request.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 12 }}>5. Service Availability</h2>
        <p>We aim for high availability but do not guarantee 100% uptime. Scheduled maintenance, third-party outages (Twilio, OpenAI), or unforeseen events may temporarily affect service. We will notify you of planned downtime where possible.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 12 }}>6. Changes to These Terms</h2>
        <p>We may update these terms from time to time. We will notify you by email at least 14 days before any material changes take effect. Continued use of the service after that date constitutes acceptance of the updated terms.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 12 }}>7. Contact</h2>
        <p>Questions about these terms? Email us at <a href="mailto:fun@bugme.travel" style={{ color: '#F26A1F' }}>fun@bugme.travel</a>.</p>
      </section>
    </main>
  )
}
