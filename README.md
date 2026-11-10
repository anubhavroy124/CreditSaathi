# CreditSaathi AI

An AI-powered credit-readiness assistant for small businesses.

CreditSaathi helps MSME owners organize business information, understand possible financing routes, identify missing documents, and prepare an application package for review. It supports preparation; lenders and scheme authorities make all eligibility and approval decisions.

This is a hackathon prototype by NEUREX, not a lending product.

## What it is designed to do

- **Build a business profile.** Collect details such as business type, location, funding need, and available records.
- **Organize documents.** Extract information from uploaded records and flag details that need the owner’s review.
- **Explore financing options.** Use official scheme information to explain possible routes and cite supporting sources.
- **Show readiness gaps.** Create a checklist of documents and information that are present, missing, or need confirmation.
- **Prepare a draft package.** Assemble a business summary, financial overview, proposed use of funds, and checklist for the owner to review.

## How the prototype should work

The owner enters business details and uploads sample or consented documents. CreditSaathi organizes the information, checks it against a small collection of official guidance, and prepares a readiness report. The owner reviews and edits the results before using them.

## Project status

This repository is being set up. We’ll build the prototype incrementally, starting with the user interface and adding backend capabilities as the team learns and develops them.

## Proposed direction

- **Frontend:** React
- **Backend:** Python
- **Document handling:** OCR and PDF/CSV extraction
- **Scheme research:** retrieval from a curated set of official sources
- **Output:** an editable readiness checklist and downloadable draft report

The final stack and features may change as the team builds the prototype.

## Responsible use and limitations

CreditSaathi does not provide loans, guarantee eligibility, or predict approval. It does not replace a lender’s assessment. Important scheme information should be checked against current official sources. Financial information should be used with the business owner’s consent, and the owner should review and approve any application-related material.

The initial demo should use synthetic or appropriately anonymized sample records. Automatic application submission and direct bank integrations are outside the initial prototype.

## Team workflow

Each team member should work on a separate Git branch and open a pull request before merging changes into the shared `main` branch. Keep passwords, API keys, and real financial documents out of the repository.