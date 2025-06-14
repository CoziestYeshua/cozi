const i = '697158687457804319';
const f = (s, e) => {
    if (!s) return '';
    const n = Date.now();
    const l = n - s;
    const t = e ? (e - s) : 0;
    const es = Math.floor(l / 1000);
    const ts = Math.floor(t / 1000);
    const ft = x => `${Math.floor(x / 60)}:${(x % 60).toString().padStart(2, '0')}`;
    return {
        elapsed: es,
        total: ts,
        elapsedFormatted: ft(es),
        totalFormatted: ft(ts),
        percent: t > 0 ? Math.min(100, (l / t) * 100) : 0
    };
};

const firebaseConfig = {
  apiKey: "AIzaSyBGikfYSHs9whsIgueUxVaUEbsjwH6tuiQ",
  authDomain: "vyowirniaki.firebaseapp.com",
  projectId: "vyowirniaki",
  storageBucket: "vyowirniaki.firebasestorage.app",
  messagingSenderId: "805214927727",
  appId: "1:805214927727:web:a85770e04eafea1724869a",
  measurementId: "G-HGSFXQNWKB"
};

// Initialize Firebase only if it hasn't been initialized
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

const counterDoc = db.collection('counters').doc('visitorCount');

async function incrementVisitorCount() {
  try {
    const newCount = await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(counterDoc);
      if (!doc.exists) {
        transaction.set(counterDoc, { count: 1 });
        return 1;
      }
      const currentCount = doc.data().count || 0;
      const newCountValue = currentCount + 1;
      transaction.update(counterDoc, { count: newCountValue });
      return newCountValue;
    });

    const countElement = document.getElementById('view-count-number');
    if (countElement) {
      countElement.innerText = newCount;
    }
  } catch (e) {
    console.error("Transaction failed: ", e);
    const countElement = document.getElementById('view-count-number');
    if (countElement) {
      countElement.innerText = "Error"; // Display "Error" on UI if transaction fails
    }
  }
}

// Call the function to increment visitor count on page load
incrementVisitorCount();

const fetchDiscordPresence = () => {
    fetch(`https://api.lanyard.rest/v1/users/${i}`)
    .then(r => r.json())
    .then(d => {
        const p = d.data;
        const a = p.activities || [];
        const dp = document.querySelector('.discord-presence');
        const ai = document.getElementById('discord-activity-image');
        const ad = document.getElementById('discord-activity-details');
        const pp = document.querySelector('.profile-pic-container .discord-profile-pic');
        const un = document.querySelector('.discord-username');
        const bc = document.querySelector('.discord-title'); // Assuming this element exists if used

        // Update Discord user info and favicon
        if (p.discord_user?.avatar) {
            const { avatar, id, username } = p.discord_user;
            const av = `https://cdn.discordapp.com/avatars/${id}/${avatar}.png?size=128`;

            if (pp) pp.src = av;
            if (un) un.textContent = username;
            if (bc) bc.textContent = username; // Update if discord-title exists
            document.title = username;

            let favicon = document.querySelector('link[rel="icon"]');
            if (!favicon) {
                favicon = document.createElement('link');
                favicon.rel = 'icon';
                document.head.appendChild(favicon);
            }
            favicon.href = av;
        }

        // Handle Discord activity display
        if (a.length > 0) {
            dp.classList.remove('no-activity');
            const currentActivity = a.find(z => z.assets) || a[0]; // Prioritize activity with assets

            if (currentActivity?.assets) {
                let imageUrl = '';
                if (currentActivity.type === 2) { // Spotify
                    imageUrl = currentActivity.assets.large_image;
                    if (imageUrl.startsWith('spotify:')) imageUrl = `https://i.scdn.co/image/${imageUrl.replace('spotify:', '')}`;
                } else { // Game/Other presence
                    const assetKey = currentActivity.assets.large_image;
                    imageUrl = assetKey.startsWith('mp:') ? `https://media.discordapp.net/${assetKey.replace('mp:', '')}` : `https://cdn.discordapp.com/app-assets/${currentActivity.application_id}/${assetKey}.png`;
                }
                ai.src = imageUrl;
                ai.style.display = 'block';
            } else {
                ai.style.display = 'none';
            }

            const activityTexts = a.map(activity => {
                let text = '';
                if (activity.type === 2) { // Spotify
                    text = `${activity.details || ''}\nby ${activity.state || ''}`;
                    if (activity.timestamps?.start && activity.timestamps?.end) {
                        const timeInfo = f(activity.timestamps.start, activity.timestamps.end);
                        text += `\n<div class="spotify-progress"><span class="time-elapsed">${timeInfo.elapsedFormatted}</span><div class="progress-container"><div class="progress-bar" style="width:${timeInfo.percent}%"></div></div><span class="time-total">${timeInfo.totalFormatted}</span></div>`;
                    }
                } else if (activity.type === 4) { // Custom Status
                    text = activity.state || '';
                } else { // Game/Other
                    text = `${activity.name || ''}\n${activity.details || ''}\n${activity.state || ''}`.trim();
                    if (activity.timestamps?.start) {
                        const elapsedTime = f(activity.timestamps.start).elapsedFormatted;
                        if (elapsedTime) text += `\n${elapsedTime} elapsed time.`;
                    }
                }
                return text;
            });
            ad.innerHTML = activityTexts.join('\n\n');
            dp.style.display = 'flex'; // Ensure presence block is visible
        } else {
            dp.classList.add('no-activity');
            ad.textContent = 'user not playing anything.';
            ai.style.display = 'none';
        }
    })
    .catch(e => {
        console.error("Failed to fetch Discord presence:", e);
        const dp = document.querySelector('.discord-presence');
        dp.classList.add('no-activity');
        document.getElementById('discord-activity-details').textContent = 'user not playing anything';
        document.getElementById('discord-activity-image').style.display = 'none';
    });
};

// Initial fetch and set interval for updates
fetchDiscordPresence();
setInterval(fetchDiscordPresence, 10000); // Fetch every 10 seconds (100ms was too frequent)

const bgAudio = document.getElementById('bg-audio');
const volumeSlider = document.getElementById('volume-slider');
const volumeIcon = document.getElementById('volume-icon');
const bgVideo = document.getElementById('bg-video');
const enterButton = document.getElementById('enterzxc');

// Set initial volume
bgAudio.volume = bgVideo.volume = volumeSlider.value / 100;

volumeSlider.addEventListener('input', e => {
    const volume = e.target.value / 100;
    bgAudio.volume = bgVideo.volume = volume;
    volumeIcon.className = `bx ${volume === 0 ? 'bxs-volume-mute' : 'bxs-volume-full'}`;
});

volumeIcon.addEventListener('click', () => {
    const newVolume = bgAudio.volume > 0 ? 0 : (volumeSlider.value / 100 || 1); // If currently muted, restore to slider value or full
    bgAudio.volume = bgVideo.volume = newVolume;
    volumeSlider.value = newVolume * 100;
    volumeIcon.className = `bx ${newVolume === 0 ? 'bxs-volume-mute' : 'bxs-volume-full'}`;
});

enterButton.addEventListener('click', () => {
    enterButton.style.opacity = '0';
    setTimeout(() => {
        enterButton.style.display = 'none';
        bgVideo.play().catch(e => console.error("Video play failed:", e));
        bgAudio.play().catch(e => console.error("Audio play failed:", e));
    }, 500);
});

// Initialize Typed.js for the "typed-text" element
// This part was missing from your original script but referenced in your HTML
document.addEventListener('DOMContentLoaded', () => {
    if (typeof Typed !== 'undefined') {
        new Typed('#typed-text', {
            strings: ['Coziest', 'Coziest', 'Coziest', 'Coziest', 'Coziest'], // Example strings
            typeSpeed: 70,
            backSpeed: 50,
            loop: true,
            showCursor: false, // Hide cursor if you prefer a clean look
        });
    } else {
        console.warn('Typed.js is not loaded. The #typed-text element will not animate.');
    }
});