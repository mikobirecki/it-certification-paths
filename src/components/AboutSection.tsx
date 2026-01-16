import { useState } from 'react'

export default function AboutSection() {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="about-section">
      <button 
        className="about-toggle"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? '▲ Hide Info' : '▼ About IT Certifications'}
      </button>
      
      {expanded && (
        <div className="about-content">
          <h2>Welcome to IT Certification Paths</h2>
          <p>
            This interactive tool helps IT professionals navigate the complex world of 
            technology certifications. Whether you're starting your career or looking to 
            advance, finding the right certification path can be challenging.
          </p>

          <h3>Why IT Certifications Matter</h3>
          <p>
            IT certifications validate your skills and knowledge in specific technologies. 
            They are recognized globally by employers and can significantly boost your 
            career prospects. Certified professionals often earn higher salaries and have 
            access to more job opportunities.
          </p>

          <h3>Supported Vendors</h3>
          <ul>
            <li>
              <strong>Amazon Web Services (AWS)</strong> — The leading cloud platform with 
              certifications ranging from Cloud Practitioner to Solutions Architect Professional.
            </li>
            <li>
              <strong>Microsoft Azure</strong> — Comprehensive cloud certifications including 
              role-based paths for administrators, developers, and architects.
            </li>
            <li>
              <strong>Google Cloud Platform (GCP)</strong> — Cloud certifications focusing on 
              data engineering, machine learning, and cloud architecture.
            </li>
            <li>
              <strong>Red Hat</strong> — Industry-leading Linux and enterprise software 
              certifications including RHCSA, RHCE, and RHCA tracks.
            </li>
            <li>
              <strong>HashiCorp</strong> — Infrastructure automation certifications for 
              Terraform, Vault, Consul, and other DevOps tools.
            </li>
            <li>
              <strong>Kubernetes (CNCF)</strong> — Container orchestration certifications 
              including CKA, CKAD, and CKS for cloud-native technologies.
            </li>
            <li>
              <strong>Microsoft</strong> — Broad range of certifications covering Microsoft 365, 
              Power Platform, Dynamics 365, and security solutions.
            </li>
            <li>
              <strong>GitHub</strong> — Certifications for GitHub Actions, administration, 
              and advanced security features.
            </li>
          </ul>

          <h3>How to Use This Tool</h3>
          <ol>
            <li><strong>Select a Vendor</strong> — Choose the technology vendor you're interested in.</li>
            <li><strong>Filter by Level</strong> — Narrow down certifications by difficulty level.</li>
            <li><strong>Filter by Domain</strong> — Focus on specific technology areas.</li>
            <li><strong>Search</strong> — Find specific certifications by name or exam code.</li>
            <li><strong>Explore the Map</strong> — Click on certifications to see details and prerequisites.</li>
          </ol>

          <h3>Certification Levels Explained</h3>
          <p>
            Most vendors organize certifications into levels:
          </p>
          <ul>
            <li><strong>Foundational/Entry</strong> — For beginners, no prerequisites required.</li>
            <li><strong>Associate</strong> — Intermediate level, some experience recommended.</li>
            <li><strong>Professional/Expert</strong> — Advanced certifications requiring deep expertise.</li>
            <li><strong>Specialty</strong> — Focused on specific technologies or use cases.</li>
          </ul>

          <h3>Tips for Success</h3>
          <ul>
            <li>Start with foundational certifications before advancing to higher levels.</li>
            <li>Use official study guides and practice exams from the vendor.</li>
            <li>Gain hands-on experience with the technologies you're studying.</li>
            <li>Join online communities and study groups for support.</li>
            <li>Plan your certification path based on your career goals.</li>
          </ul>

          <p className="about-footer">
            <em>
              This tool is maintained by the community. Data is regularly updated to reflect 
              the latest certification offerings. If you notice any errors or have suggestions, 
              please use the feedback link above.
            </em>
          </p>
        </div>
      )}
    </div>
  )
}
