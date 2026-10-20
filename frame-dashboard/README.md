# Frame Dashboard: a custom app for a Samsung Frame TV

A full-screen ambient app for the TV:

- A big clock and the date
- Live weather with a 3-day forecast (from Open-Meteo, which is free and needs no API key)
- A rotating Bible verse that starts each day on the "verse of the day"
- A background that changes colour through the day (dawn, daytime, sunset, night)
- A small layout drift every few minutes, so nothing stays in one exact spot for hours

## Remote buttons

| Button | Action |
|---|---|
| ◀ / ▶ | Previous / next verse |
| ▲ | Try a different sky colour |
| ▼ | Return the sky to following the time of day |
| OK (or Play/Pause, or Red) | Switch between the full dashboard and the clock only |
| Back | Exit the app |

## Customize it

Edit `js/config.js` to change the city, °F/°C, the 12- or 24-hour clock and timings.
Edit `js/verses.js` to add or change verses.

## Preview it on your computer first

Open `index.html` in Chrome and press F11 for full screen. The arrow keys and Enter act as the remote.

## Install it on the TV (one-time setup, about 30 minutes)

Samsung doesn't allow app sideloading from a USB stick, so you need its free developer tools.

1. **Install Tizen Studio** on a Windows or Mac computer (https://developer.tizen.org/development/tizen-studio/download).
   In its *Package Manager*, install **Samsung TV Extensions** and the **Samsung Certificate Extension**.
2. **Turn on Developer Mode on the TV.** Open **Apps**, then type **1 2 3 4 5** on the remote's number pad (or the on-screen one).
   Switch Developer Mode **On** and enter your **computer's** IP address. Restart the TV (hold Power until it reboots).
3. **Connect to the TV.** In Tizen Studio, open *Tools → Device Manager → Remote Device Manager → +* and enter the TV's IP address
   (on the TV: *Settings → General → Network → Network Status → IP Settings*). Toggle the connection on.
4. **Create a Samsung certificate.** Open *Tools → Certificate Manager → +* and choose **Samsung**, then **TV**, and sign in with a Samsung account.
   When it asks for device IDs, the TV's DUID is filled in automatically while the TV is connected.
5. **Import and run the app.** Open *File → Import → Tizen → Tizen Project* and select this `frame-dashboard` folder.
   Right-click the project and choose *Run As → Tizen Web Application*. It installs on the TV and launches.

After that, the app appears in the TV's Apps list. Re-run step 5 whenever you change the code.

Note: apps installed with a developer certificate can expire, usually after a few months or after a TV firmware update.
If the app disappears, re-run step 5.
