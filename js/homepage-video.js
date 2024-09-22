// video.js

// Scroll-Controlled Video Playback
document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('scroll-video');
    let scrollPos = 0;
    let ticking = false;

    video.addEventListener('loadedmetadata', () => {
        const videoDuration = video.duration;

        const handleScroll = () => {
            scrollPos = window.scrollY;
            const scrollPercent = scrollPos / (document.body.scrollHeight - window.innerHeight);
            let videoTime = scrollPercent * videoDuration;
            videoTime = Math.max(0, Math.min(videoTime, videoDuration));
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
