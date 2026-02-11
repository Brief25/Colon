// Initialize EmailJS
(function () {
    emailjs.init("V_uftsdRQOQdfsLPe"); // Public Key from EmailJS
})();

// Wait for DOM to load
document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("contact-form");

    if (!form) return;

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        emailjs.sendForm(
            "service_w6i67dr",   // EmailJS service ID
            "template_dt0ux1g",  // EmailJS template ID
            form
        ).then(
            function () {
                alert("✅ Message sent successfully! We will contact you soon.");
                form.reset();
            },
            function (error) {
                alert("❌ Failed to send message. Please try again.");
                console.error("EmailJS Error:", error);
            }
        );
    });

});
