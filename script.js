document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('signupForm');
    const submitBtn = document.querySelector('.submit-btn');

    // Phone number validation
    const phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('input', (e) => {
        const phone = e.target.value.replace(/\D/g, '');
        if (phone.length > 10) {
            e.target.value = phone.slice(0, 10);
        }
    });

    // Form submission handler
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Basic form validation
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // Get form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Show loading state
        submitBtn.classList.add('loading');
        submitBtn.textContent = 'Submitting...';

        try {
            // Send data to backend
            const response = await fetch('http://localhost:3001/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to submit form');
            }

            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.textContent = 'Thank you for signing up! We will contact you shortly.';
            form.appendChild(successMessage);
            successMessage.style.display = 'block';

            // Reset form
            form.reset();
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('There was an error submitting the form: ' + error.message);
        } finally {
            // Reset button state
            submitBtn.classList.remove('loading');
            submitBtn.textContent = 'Sign Up for Tutoring';
        }
    });

    // Real-time validation feedback
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            if (input.validity.valid) {
                input.classList.remove('invalid');
                input.classList.add('valid');
            } else {
                input.classList.remove('valid');
                input.classList.add('invalid');
            }
        });
    });
}); 