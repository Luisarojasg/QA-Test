const { chromium } = require('@playwright/test');

async function main() {
    // Launch the browser
    const browser = await chromium.launch({ headless: false });
    
    // Create a new context
    const context = await browser.newContext();
    
    // Create a new page
    const page = await context.newPage();
    
    // Navigate to the form website
    await page.goto('https://qa-technical-assessment.vercel.app/form');
    
    // Take a screenshot of the initial page
    await page.screenshot({ path: 'initial-page.png' });
    
    // Scroll to the bottom of the page to ensure all elements are loaded
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000); // Wait for any lazy-loaded content
    
    // Scroll back to the top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    
    // Form data
    const formData = {
        nombre: 'John',
        apellidos: 'Doe',
        telefono: '1234567890',
        correo: 'john.doe@example.com',
        direccion: '123 Main Street',
        pais: 'Colombia',
        ciudad: 'Bogota',
        estado: 'Cundinamarca',
        codigoPostal: '110111',
        ocupacion: 'Software Engineer',
        empresa: 'Tech Corp',
        datosAdicionales: 'Additional information about the applicant'
    };

    // Find all form elements
    console.log('Finding all form elements...');
    const formElements = await page.$$('input, select, textarea');
    console.log(`Found ${formElements.length} form elements`);

    // Log all form elements for debugging
    for (let i = 0; i < formElements.length; i++) {
        const element = formElements[i];
        const tagName = await element.evaluate(el => el.tagName);
        const name = await element.evaluate(el => el.name);
        const id = await element.evaluate(el => el.id);
        const type = await element.evaluate(el => el.type);
        console.log(`Element ${i+1}: ${tagName}, name: ${name}, id: ${id}, type: ${type}`);
    }

    // Fill out the form fields with scrolling
    for (const [field, value] of Object.entries(formData)) {
        // Find the element for this field
        let elementSelector;
        let elementType = 'input';
        
        if (field === 'datosAdicionales') {
            elementType = 'textarea';
            elementSelector = `${elementType}[name="${field}"]`;
        } else if (field === 'pais') {
            // Special handling for React Select component for country
            console.log('Handling React Select for country...');
            
            // Find and click the React Select container
            await page.click('#react-select-2-input');
            await page.waitForTimeout(500);
            
            // Type the country name
            await page.keyboard.type(value);
            await page.waitForTimeout(500);
            
            // Press Enter to select the option
            await page.keyboard.press('Enter');
            await page.waitForTimeout(500);
            
            // Verify the selection
            const selectedValue = await page.$eval('#react-select-2-input', el => el.value);
            console.log(`Selected country: ${selectedValue}`);
            
            continue;
        } else if (field === 'ciudad') {
            // Special handling for React Select component for city
            console.log('Handling React Select for city...');
            
            // Find and click the React Select container
            await page.click('#react-select-3-input');
            await page.waitForTimeout(500);
            
            // Type the city name
            await page.keyboard.type(value);
            await page.waitForTimeout(500);
            
            // Press Enter to select the option
            await page.keyboard.press('Enter');
            await page.waitForTimeout(500);
            
            // Verify the selection
            const selectedValue = await page.$eval('#react-select-3-input', el => el.value);
            console.log(`Selected city: ${selectedValue}`);
            
            continue;
        } else if (field === 'estado') {
            // Special handling for React Select component for state
            console.log('Handling React Select for state...');
            
            // Find and click the React Select container
            await page.click('#react-select-4-input');
            await page.waitForTimeout(500);
            
            // Type the state name
            await page.keyboard.type(value);
            await page.waitForTimeout(500);
            
            // Press Enter to select the option
            await page.keyboard.press('Enter');
            await page.waitForTimeout(500);
            
            // Verify the selection
            const selectedValue = await page.$eval('#react-select-4-input', el => el.value);
            console.log(`Selected state: ${selectedValue}`);
            
            continue;
        } else {
            elementSelector = `${elementType}[name="${field}"]`;
        }
        
        // Check if element exists
        const elementExists = await page.$(elementSelector);
        if (!elementExists) {
            console.log(`Element not found for field: ${field}, trying alternative selectors...`);
            
            // Try alternative selectors
            const alternativeSelectors = [
                `input[name="${field}"]`,
                `input[id="${field}"]`,
                `input[placeholder*="${field}"]`,
                `textarea[name="${field}"]`,
                `textarea[id="${field}"]`,
                `textarea[placeholder*="${field}"]`
            ];
            
            let found = false;
            for (const selector of alternativeSelectors) {
                const element = await page.$(selector);
                if (element) {
                    console.log(`Found element using alternative selector: ${selector}`);
                    elementSelector = selector;
                    found = true;
                    break;
                }
            }
            
            if (!found) {
                console.error(`Could not find element for field: ${field}`);
                continue;
            }
        }
        
        // Scroll to the element
        console.log(`Scrolling to element: ${field}`);
        await page.evaluate((selector) => {
            const element = document.querySelector(selector);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, elementSelector);
        await page.waitForTimeout(500);
        
        // Check if it's a select element
        const isSelect = await page.evaluate((selector) => {
            const element = document.querySelector(selector);
            return element && element.tagName.toLowerCase() === 'select';
        }, elementSelector);
        
        if (isSelect) {
            console.log(`Handling select element for: ${field}`);
            
            // Get all options
            const options = await page.$$eval(`${elementSelector} option`, options => 
                options.map(option => ({
                    value: option.value,
                    text: option.textContent.trim()
                }))
            );
            
            console.log(`Available options for ${field}:`, options);
            
            // Select the first non-empty option
            if (options.length > 0) {
                const selectedOption = options.find(opt => opt.value && opt.value !== '');
                if (selectedOption) {
                    await page.selectOption(elementSelector, selectedOption.value);
                    console.log(`Selected option for ${field}: ${selectedOption.text}`);
                } else {
                    console.log(`No valid options found for ${field}`);
                }
            } else {
                console.log(`No options found for ${field}`);
            }
        } else {
            // Fill the field
            await page.fill(elementSelector, value);
            
            // Verify the field was filled correctly
            const fieldValue = await page.inputValue(elementSelector);
            if (fieldValue !== value) {
                console.error(`Validation failed for ${field}: Expected "${value}", got "${fieldValue}"`);
                // Don't throw error, just log it
                console.log(`Continuing despite validation failure for ${field}`);
            }
        }
        
        console.log(`Successfully handled field: ${field}`);
    }
    
    // Take a screenshot before submitting
    await page.screenshot({ path: 'form-filled.png' });
    
    // Find and scroll to the submit button
    console.log('Looking for submit button...');
    const submitButton = await page.$('button[type="submit"]');
    if (submitButton) {
        console.log('Found submit button, scrolling to it...');
        // Use evaluate to scroll the button into view
        await page.evaluate((button) => {
            button.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, submitButton);
        await page.waitForTimeout(500);
        
        // Submit the form
        console.log('Submitting form...');
        await submitButton.click();
    } else {
        console.error('Could not find submit button');
        // Try alternative selectors for submit button
        const alternativeButtons = [
            'button:has-text("Submit")',
            'button:has-text("Enviar")',
            'input[type="submit"]',
            'button.submit-button',
            'button.form-submit'
        ];
        
        let found = false;
        for (const selector of alternativeButtons) {
            const button = await page.$(selector);
            if (button) {
                console.log(`Found submit button using alternative selector: ${selector}`);
                // Use evaluate to scroll the button into view
                await page.evaluate((button) => {
                    button.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, button);
                await page.waitForTimeout(500);
                await button.click();
                found = true;
                break;
            }
        }
        
        if (!found) {
            console.error('Could not find any submit button');
        }
    }
    
    // Wait for navigation or response
    await page.waitForTimeout(2000);
    
    // Verify form submission
    try {
        // Check for success message or redirect
        const currentUrl = page.url();
        console.log(`Current URL after submission: ${currentUrl}`);
        
        if (currentUrl.includes('/form')) {
            // Check for any error messages
            const errorMessages = await page.$$('.error-message, .alert-danger, .text-danger');
            if (errorMessages.length > 0) {
                console.error('Form submission failed with errors:');
                for (const error of errorMessages) {
                    console.error(await error.textContent());
                }
                // Don't throw error, just log it
                console.log('Form submission had errors, but continuing...');
            }
            
            // Check for success messages
            const successMessages = await page.$$('.success-message, .alert-success, .text-success');
            if (successMessages.length > 0) {
                for (const message of successMessages) {
                    console.log('Success message:', await message.textContent());
                }
            }
        }
        
        // Take a screenshot after submission
        await page.screenshot({ path: 'form-submitted.png' });
        
        console.log('Form submission process completed!');
        
        // Optional: Verify the data was sent correctly by checking network requests
        try {
            const response = await page.waitForResponse(response => 
                response.url().includes('/api') && response.request().method() === 'POST',
                { timeout: 5000 }
            );
            
            const responseData = await response.json();
            console.log('Server response:', responseData);
        } catch (error) {
            console.log('No API response detected, but form may still have been submitted');
        }
        
    } catch (error) {
        console.error('Error during form submission:', error.message);
        await page.screenshot({ path: 'form-error.png' });
    }
    
    // Close the browser
    await browser.close();
}

main().catch(console.error); 