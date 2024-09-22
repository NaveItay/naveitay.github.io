// homepage-video.js

document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('scroll-video');
    let scrollPos = 0;
    let ticking = false;

    video.addEventListener('loadedmetadata', () => {
        const videoDuration = video.duration;

        const handleScroll = () => {
            scrollPos = window.scrollY;

            // Calculate the scroll percentage
            const scrollPercent = scrollPos / (document.body.scrollHeight - window.innerHeight);

            // Map scroll percentage to video duration
            let videoTime = scrollPercent * videoDuration;

            // Clamp videoTime between 0 and videoDuration
            videoTime = Math.max(0, Math.min(videoTime, videoDuration));

            // Set video current time
            video.currentTime = videoTime;

            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(handleScroll);
                ticking = true;
            }
        });

        // Initial call to set video time
        handleScroll();
    });
});
