# QR Code Attendance System

## System Requirements

### Core Features
- QR scanning
- Gmail login
- Save to Google Drive
- Export CSV

### 📱 Hardware Requirements

#### Mobile (Android / iOS) - Recommended
- Camera: Minimum 5MP, auto-focus for fast scanning
- RAM: 2GB minimum, 3GB+ recommended
- Storage: 50MB free space for the app + 100MB extra for data/cache
- OS: Android 7.0+ / iOS 13.0+
- Display: 5" screen or larger, 7" tablet recommended
- Connection: Wi-Fi / 4G / 5G for Google Drive sync
- Battery: 2000mAh or higher; supports 4+ hours of continuous use
- Optional: Flashlight for low-light scanning, stand/holder

#### Computer / Web Version
- Processor: 1.5GHz dual-core or better
- RAM: 2GB minimum, 4GB recommended
- Storage: 100MB free
- Camera: USB webcam 720p or higher
- OS: Windows 10+, macOS 10.15+, ChromeOS, Linux
- Browser: Chrome 90+, Edge 90+, Firefox 88+, Safari 14+

### 💻 Software Requirements

#### Core
- QR Code Reader: Built-in camera scanner using ZXing or jsQR
- Authentication: Gmail sign-in using Google OAuth 2.0
- Data Export: CSV generation with download support
- Cloud Save: Google Drive API integration for direct file saving

#### Minimum OS Versions
- Android: 7.0 (Nougat) or newer
- iOS: 13.0 or newer
- Windows: 10 / 11
- macOS: 10.15 Catalina or newer
- Web: Modern browser only

#### Permissions Needed
- Camera access for QR scanning
- Internet access for login and Google Drive sync
- Storage access for saving CSV locally
- Google account permission for Drive access

### 🔌 Network & Connectivity
- Internet: Stable 1+ Mbps required for login and Google Drive
- Offline: Can scan and store locally, then sync later when online
- Google Services: Must allow access to drive.google.com and accounts.google.com

### ✅ Recommended Specs (Best Performance)
- Android: 8.0+, 3GB RAM, 8MP camera
- iOS: 15.0+, iPhone 8 or newer
- Computer: 4GB RAM, 2GHz CPU, 1080p webcam
- Storage: 500MB free space

### 📌 Technical Notes
- Works fully with Gmail / Google Account only
- CSV format: ID, Name, Date, Time, Status
- Google Drive saves as CSV or Google Sheets automatically
- No server needed; works as a web app or mobile app
