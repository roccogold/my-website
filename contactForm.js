document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = 'Sending message...';

    // Prepare form data
    const formData = new FormData(form);

    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString()
      });
      if (response.ok) {
        status.textContent = 'Message sent! Thank you for reaching out.';
        form.reset();
      } else {
        throw new Error('Network response was not ok');
      }
    } catch (error) {
      status.textContent = 'Oops! Something went wrong. Please try again later.';
      console.error('Form submission error:', error);
    }
  });
});
