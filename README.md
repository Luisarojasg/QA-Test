# QA Test Automation with Playwright

This project contains an automated test script for filling out a form on a website using Playwright.

## Features

- Automated form filling with scrolling
- Special handling for React Select components
- Screenshot capture at different stages
- Form submission validation
- Error handling and logging

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/Luisarojasg/QA-Test.git
   cd QA-Test
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Install Playwright browsers:
   ```
   npx playwright install chromium
   ```

## Usage

Run the automation script:

```
node index.js
```

The script will:
1. Open a Chrome browser window
2. Navigate to the form website
3. Fill out all fields, including React Select components
4. Take screenshots at different stages
5. Submit the form and validate the submission

## Screenshots

The script generates the following screenshots:
- `initial-page.png`: Initial state of the page
- `form-filled.png`: Form after all fields are filled
- `form-submitted.png`: Page after form submission
- `form-error.png`: Page if there's an error during submission

## Troubleshooting

If you encounter issues:

1. Make sure Playwright is properly installed:
   ```
   npm install @playwright/test
   npx playwright install chromium
   ```

2. Check for any error messages in the console

3. Verify that the website is accessible in your browser

## License

MIT 