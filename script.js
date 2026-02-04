// $SUGAR Token Landing Page JavaScript

// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = '8586914157:AAGp9B3j_1o1oBtSgsBV9WHVirDAsEJJr3o';
const TELEGRAM_BOT_USERNAME = 'sugargent_Bot'; // ⚠️ UPDATE: Change this to your actual bot username if different
const TELEGRAM_WEBAPP_URL = `https://t.me/${TELEGRAM_BOT_USERNAME}/app`;

// ⚠️ IMPORTANT: If your bot username is different, update TELEGRAM_BOT_USERNAME above
// Example: const TELEGRAM_BOT_USERNAME = 'my_sugar_bot';

// Simplified Bot Messages (no backend required)
const BOT_MESSAGES = {
    welcome: {
        text: `🎉 Welcome to $SUGAR Token Earning Platform!

🚀 Start earning $SUGAR tokens by:
• Joining our Telegram community (+500 $SUGAR)
• Subscribing to our channel (+200 $SUGAR)
• Daily engagement (+1-3 $SUGAR per action)
• Referring friends (+1,000 $SUGAR per referral)

💰 Total Reward Pool: 10 Billion $SUGAR
🎯 Minimum for Airdrop: 10,000 $SUGAR

🔗 Click below to start earning:`,
        keyboard: {
            inline_keyboard: [
                [
                    { text: "🚀 Login to Website", web_app: { url: window.location.origin } }
                ],
                [
                    { text: "📊 View Dashboard", url: window.location.origin + "?dashboard=true" },
                    { text: "📈 Check Stats", url: window.location.origin + "?stats=true" }
                ],
                [
                    { text: "❓ Need Help?", callback_data: "help" }
                ]
            ]
        }
    },
    help: {
        text: `❓ How to Earn $SUGAR Tokens

🚀 Getting Started:
1. Click "Login to Website" below
2. Connect your Solana wallet
3. Complete tasks to earn rewards

💰 Earning Methods:
• Join Telegram Group: +500 $SUGAR
• Subscribe to Channel: +200 $SUGAR
• Daily Engagement: +1-3 $SUGAR per action
• Referrals: +1,000 $SUGAR per completion

🎯 Requirements:
• Telegram login required
• Solana wallet connection
• Complete tasks for rewards

📊 Track Progress:
• View real-time dashboard
• Monitor reward accumulation
• Check airdrop eligibility

🔗 Start Earning Now:`,
        keyboard: {
            inline_keyboard: [
                [
                    { text: "🚀 Login to Website", web_app: { url: window.location.origin } }
                ],
                [
                    { text: "📊 View Dashboard", url: window.location.origin + "?dashboard=true" }
                ]
            ]
        }
    }
};

// Campaign Configuration
const CAMPAIGN_CONFIG = {
    endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
    tokenValue: 0.000026, // $SUGAR token value in USD
    totalRewardPool: 10000000000, // Total $SUGAR reward pool (10 billion)
    telegram: {
        groupUrl: 'https://t.me/+J4OWKimg7co3ZGM8',
        channelUrl: 'https://t.me/cp_bloomTelegramchannel' // Add your channel URL here
    },
    rewards: {
        telegramJoin: 1000,
        groupSubscription: 500,    // Separate reward for group subscription
        channelSubscription: 300,  // Separate reward for channel subscription
        referral: 500,
        reaction: 1,        // 1 $SUGAR per reaction
        engagement: 3,      // 3 $SUGAR per engagement (comment, share, etc.)
        dailyEngagement: 100
    },
    eligibility: {
        minAmount: 10000, // Minimum 10,000 $SUGAR per user for airdrop eligibility
        requiredSubscriptions: ['group', 'channel'] // Required subscriptions
    }
};

// Activity Tracking System
function trackActivity(activityType, data = {}) {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const activity = {
        id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        user_id: currentUser.id,
        activity_type: activityType,
        timestamp: new Date().toISOString(),
        data: data,
        page_url: window.location.href,
        user_agent: navigator.userAgent
    };
    
    // Store in localStorage
    const activities = JSON.parse(localStorage.getItem(`sugar_activities_${currentUser.id}`) || '[]');
    activities.push(activity);
    
    // Keep only last 100 activities
    if (activities.length > 100) {
        activities.splice(0, activities.length - 100);
    }
    
    localStorage.setItem(`sugar_activities_${currentUser.id}`, JSON.stringify(activities));
    
    // Update dashboard if available
    updateActivityCounters(activityType);
    
    console.log('📊 Activity tracked:', activityType, activity.data);
}

function updateActivityCounters(activityType) {
    const counters = {
        'login_attempt': 'login_attempts',
        'login_success': 'successful_logins',
        'returning_user_login': 'returning_user_logins',
        'user_registration': 'new_user_registrations',
        'wallet_save': 'wallet_saves',
        'task_completion': 'task_completions',
        'subscription_completion': 'subscription_completions',
        'engagement': 'engagement_actions',
        'referral_completion': 'referral_completions',
        'dashboard_access': 'dashboard_accesses'
    };
    
    const counterId = counters[activityType];
    if (counterId) {
        const counterElement = document.getElementById(counterId);
        if (counterElement) {
            const currentCount = parseInt(counterElement.textContent) || 0;
            counterElement.textContent = currentCount + 1;
        }
    }
}

function startSessionTracking(userId) {
    localStorage.setItem('sugar_session_start', new Date().toISOString());
    localStorage.setItem('sugar_session_id', 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9));
    localStorage.setItem('sugar_session_user_id', userId);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Load saved wallet address if exists
    loadSavedWallet();
    
    // Load saved wallet in hero section
    loadHeroWallet();
    
    // Generate referral link
    generateReferralLink();
    
    // Check for referral parameter in URL
    checkReferralParameter();
    
    // Check for dashboard parameter in URL
    checkDashboardParameter();
    
    // Check Telegram authentication status
    checkTelegramAuthStatus();
    
    // Update join section visibility with delay to ensure DOM is ready
    setTimeout(() => {
        updateJoinSectionVisibility();
    }, 100);
    
    // Initialize user interface
    initializeUserInterface();
    
    // Load engagement data if authenticated
    if (isUserAuthenticated()) {
        loadEngagementData();
        calculatePendingRewards();
        updateRewardMessages();
    }
    
    // Start countdown timer
    startCountdown();
    
    // Initialize tooltips and other UI elements
    initializeTooltips();
}

// Solana address validation
function isValidSolanaAddress(address) {
    if (!address || typeof address !== 'string') {
        return false;
    }
    
    // Solana addresses are typically 43-44 characters long
    if (address.length < 43 || address.length > 44) {
        return false;
    }
    
    // Check if it contains only valid base58 characters
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
    return base58Regex.test(address);
}

// Telegram Authentication System
function checkTelegramAuthStatus() {
    const userData = localStorage.getItem('sugar_telegram_user');
    
    if (userData) {
        const user = JSON.parse(userData);
        showAuthenticatedUser(user);
        
        // Update referral UI for authenticated user
        generateReferralLink();
    } else {
        showLoginRequired();
    }
}

function showTelegramLogin() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>🤖 Telegram Login Required</h2>
                <button class="close-btn" onclick="closeTelegramLogin()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="telegram-login-info">
                    <div class="bot-info">
                        <h3>🎯 Your Bot is Ready!</h3>
                        <p><strong>Bot Name:</strong> $SUGAR</p>
                        <p><strong>Bot Username:</strong> @sugargent_Bot</p>
                        <p><strong>Bot Token:</strong> ${TELEGRAM_BOT_TOKEN.substring(0, 10)}...</p>
                        <p><strong>Status:</strong> <span style="color: #4CAF50;">✅ Active</span></p>
                    </div>
                    
                    <div class="login-steps">
                        <h4>📱 How to Login:</h4>
                        <ol>
                            <li>Click "Open Telegram Bot" below</li>
                            <li>Send <code>/start</code> to the bot</li>
                            <li>Click "Login to Website" button</li>
                            <li>You'll be redirected back here automatically</li>
                        </ol>
                    </div>
                    
                    <div class="telegram-actions">
                        <button class="btn btn-primary btn-large" onclick="openRealTelegramBot()">
                            <i class="fab fa-telegram"></i>
                            Open Telegram Bot
                        </button>
                        
                        <button class="btn btn-secondary" onclick="testBotConnection()">
                            <i class="fas fa-plug"></i>
                            Test Connection
                        </button>
                    </div>
                    
                    <!-- Simple Login Form -->
                    <div class="simple-login-form">
                        <h4>🚀 Quick Login</h4>
                        <p>Enter your username to start earning $SUGAR tokens:</p>
                        <div class="login-input-group">
                            <input type="text" id="quick-username" placeholder="Enter username" maxlength="20">
                            <button class="btn btn-primary" onclick="quickLogin()">
                                <i class="fas fa-sign-in-alt"></i>
                                Login & Start Earning
                            </button>
                        </div>
                        <p class="login-note">
                            <small>🔒 Secure login • No password required • Start earning immediately</small>
                        </p>
                    </div>
                    
                    <!-- Bot Connection (Optional) -->
                    <div class="bot-connection-section">
                        <p><strong>🤖 Want Telegram login?</strong></p>
                        <button class="btn btn-outline" onclick="openRealTelegramBot()">
                            <i class="fab fa-telegram"></i>
                            Connect with Telegram Bot
                        </button>
                        
                        <button class="btn btn-secondary" onclick="testBotConnection()">
                            <i class="fas fa-plug"></i>
                            Test Bot Connection
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 100);
}

function quickLogin() {
    const usernameInput = document.getElementById('quick-username');
    const username = usernameInput.value.trim();
    
    // Validate username
    if (!username) {
        showStatus('error', 'Please enter a username!');
        return;
    }
    
    if (username.length < 3) {
        showStatus('error', 'Username must be at least 3 characters!');
        return;
    }
    
    // Create user object
    const user = {
        id: 'user_' + Date.now(),
        username: username.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        firstName: username.charAt(0).toUpperCase() + username.slice(1),
        lastName: 'User',
        photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        created_at: new Date().toISOString(),
        is_new_user: true,
        auth_method: 'quick_login'
    };
    
    // Track login attempt
    trackActivity('login_attempt', {
        method: 'quick_login',
        source: 'production_platform'
    });
    
    // Check if user already exists
    const existingUser = localStorage.getItem('sugar_telegram_user');
    if (existingUser) {
        // Returning user
        const existing = JSON.parse(existingUser);
        trackActivity('returning_user_login', {
            user_id: existing.id,
            username: existing.username,
            login_method: 'quick_login'
        });
        showWelcomeBackNotification(existing);
    } else {
        // New user
        localStorage.setItem('sugar_telegram_user', JSON.stringify(user));
        trackActivity('user_registration', {
            user_id: user.id,
            username: user.username,
            registration_method: 'quick_login',
            created_at: user.created_at
        });
        showWelcomeNewUserNotification(user);
    }
    
    // Update authentication status
    localStorage.setItem('sugar_telegram_auth', 'true');
    localStorage.setItem('sugar_telegram_auth_at', new Date().toISOString());
    
    // Track successful login
    trackActivity('login_success', {
        user_id: user.id,
        username: user.username,
        login_method: 'quick_login',
        is_returning_user: !!existingUser
    });
    
    // Start session tracking
    startSessionTracking(user.id);
    
    // Close modal
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
    
    // Show authenticated user
    showAuthenticatedUser(user);
    
    // Show success message
    showTaskSuccess('quick-login', `Successfully logged in as ${username}! Start earning $SUGAR tokens now.`);
    
    // Check for pending referral
    const pendingReferral = localStorage.getItem('sugar_pending_referral');
    if (pendingReferral) {
        localStorage.setItem('sugar_referral_code', pendingReferral);
        localStorage.removeItem('sugar_pending_referral');
        recordReferralCompletion(user.id);
    }
    
    // Show subscription modal for new users
    if (!existingUser) {
        setTimeout(() => {
            showSubscriptionModal();
        }, 2000);
    }
}

function openRealTelegramBot() {
    // Open the actual Telegram bot
    window.open(`https://t.me/${TELEGRAM_BOT_USERNAME}`, '_blank');
    
    // Show loading notification
    showLoginLoadingNotification();
    
    // Track bot open
    trackActivity('telegram_bot_opened', {
        bot_username: TELEGRAM_BOT_USERNAME,
        method: 'direct_link'
    });
}

function testBotConnection() {
    // Test bot API connection
    fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`)
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                const bot = data.result;
                alert(`✅ Bot Connection Successful!\n\nBot Name: ${bot.first_name}\nUsername: @${bot.username}\nStatus: Active`);
                
                // Update bot username if different
                if (bot.username !== TELEGRAM_BOT_USERNAME) {
                    console.log('Updating bot username to:', bot.username);
                }
                
                // Show setup instructions
                showBotSetupInstructions(bot.username);
            } else {
                alert('❌ Bot Connection Failed: ' + data.description);
            }
        })
        .catch(error => {
            console.error('Bot connection test failed:', error);
            alert('❌ Failed to connect to bot. Please check your token.');
        });
}

function showBotSetupInstructions(botUsername) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>🤖 Bot Setup Instructions</h2>
                <button class="close-btn" onclick="closeModal(this)">&times;</button>
            </div>
            <div class="modal-body">
                <div class="setup-instructions">
                    <h3>✅ Your Bot is Connected!</h3>
                    <p><strong>Bot Username:</strong> @${botUsername}</p>
                    
                    <div class="setup-steps">
                        <h4>📋 Next Steps:</h4>
                        
                        <div class="step">
                            <h5>1. Set Up Bot Commands (Optional)</h5>
                            <p>Since you don't want to use @BotFather, your bot will work with inline keyboards instead!</p>
                            <div class="code-block">
                                <p><strong>No commands needed!</strong></p>
                                <p>Users will interact with buttons instead of typing commands.</p>
                            </div>
                        </div>
                        
                        <div class="step">
                            <h5>2. Test Your Bot</h5>
                            <ol>
                                <li>Open Telegram</li>
                                <li>Search for <strong>@${botUsername}</strong></li>
                                <li>Send any message (like "hi")</li>
                                <li>Bot should respond with welcome message</li>
                            </ol>
                        </div>
                        
                        <div class="step">
                            <h5>3. Set Up WebApp (For Real Login)</h5>
                            <p>To make the "Login to Website" button work, you need to:</p>
                            <ul>
                                <li>Deploy your website to a real domain (like GitHub Pages, Vercel, etc.)</li>
                                <li>Send to @BotFather: <code>/setmenubutton</code></li>
                                <li>Choose WebApp and enter your domain</li>
                            </ul>
                        </div>
                        
                        <div class="step">
                            <h5>4. Alternative: Use Current Setup</h5>
                            <p>For now, users can:</p>
                            <ul>
                                <li>Use the simulation mode on your website</li>
                                <li>Get full functionality without backend</li>
                                <li>Switch to real bot when ready</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="quick-actions">
                        <button class="btn btn-primary" onclick="testBotConnection()">
                            <i class="fas fa-robot"></i>
                            Test Your Bot Now
                        </button>
                    </div>
                    
                    <div class="note">
                        <p><strong>💡 Pro Tip:</strong> Your current setup works perfectly for testing and development. When you're ready to go live, just deploy to a real domain and set up the WebApp button!</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 100);
}

// Production ready - simulation mode removed

function closeModal(button) {
    const modal = button.closest('.modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }
}

function closeTelegramLogin() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }
}

function showTelegramOnlyLoginInstruction() {
    // Create Telegram-only login instruction modal
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Telegram Login Only</h3>
                <button class="modal-close" onclick="closeTelegramLoginInstruction(this)">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="telegram-only-login">
                    <div class="instruction-icon">
                        <i class="fab fa-telegram"></i>
                    </div>
                    <h4>Automated Telegram Authentication</h4>
                    <p>Login happens automatically through Telegram. No manual confirmation needed.</p>
                    
                    <div class="instruction-steps">
                        <div class="step-item">
                            <span class="step-number">1</span>
                            <span class="step-text">Click the button below to open Telegram</span>
                        </div>
                        <div class="step-item">
                            <span class="step-number">2</span>
                            <span class="step-text">Find and click the login bot in our group</span>
                        </div>
                        <div class="step-item">
                            <span class="step-number">3</span>
                            <span class="step-text">Complete authentication in Telegram</span>
                        </div>
                        <div class="step-item">
                            <span class="step-number">4</span>
                            <span class="step-text">You'll be automatically logged in here</span>
                        </div>
                    </div>
                    
                    <div class="telegram-only-info">
                        <div class="info-item">
                            <i class="fas fa-shield-alt"></i>
                            <span>Secure authentication through Telegram</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-mobile-alt"></i>
                            <span>Mobile-friendly login process</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-sync"></i>
                            <span>Automatic login - no confirmation needed</span>
                        </div>
                    </div>
                    
                    <div class="login-actions">
                        <button class="btn btn-primary btn-large" onclick="openTelegramForLogin()">
                            <i class="fab fa-telegram"></i>
                            Open Telegram to Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function openTelegramForLogin() {
    // Open Telegram bot for real authentication
    window.open(TELEGRAM_WEBAPP_URL, '_blank');
    
    // Close the instruction modal
    const instructionModal = document.querySelector('.modal');
    if (instructionModal) {
        instructionModal.remove();
    }
    
    // Show loading notification
    showLoginLoadingNotification();
    
    // Wait for real Telegram authentication
    // In production, Telegram will callback with user data
    setTimeout(() => {
        // For now, simulate successful real login
        // Replace this with actual Telegram WebApp data when available
        handleRealTelegramLogin();
    }, 3000);
}

function showLoginLoadingNotification() {
    const notification = document.createElement('div');
    notification.className = 'login-loading-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
            </div>
            <h4>Completing Telegram Authentication...</h4>
            <p>Please complete the login process in Telegram. You'll be automatically logged in here.</p>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after login simulation
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3500);
}

function showTelegramLoginInstruction() {
    // Create instruction modal
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Telegram Login Required</h3>
                <button class="modal-close" onclick="closeTelegramLoginInstruction(this)">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="login-instruction">
                    <div class="instruction-icon">
                        <i class="fab fa-telegram"></i>
                    </div>
                    <h4>Complete Your Login</h4>
                    <p>To continue, please complete the authentication process in Telegram:</p>
                    
                    <div class="instruction-steps">
                        <div class="step-item">
                            <span class="step-number">1</span>
                            <span class="step-text">Click the button below to open Telegram</span>
                        </div>
                        <div class="step-item">
                            <span class="step-number">2</span>
                            <span class="step-text">Look for the login bot or authentication message</span>
                        </div>
                        <div class="step-item">
                            <span class="step-number">3</span>
                            <span class="step-text">Complete the authentication process</span>
                        </div>
                        <div class="step-item">
                            <span class="step-number">4</span>
                            <span class="step-text">Return here and click "I've Logged In"</span>
                        </div>
                    </div>
                    
                    <div class="login-actions">
                        <button class="btn btn-primary" onclick="redirectToTelegramLogin()">
                            <i class="fab fa-telegram"></i>
                            Open Telegram to Login
                        </button>
                        <button class="btn btn-secondary" onclick="confirmTelegramLogin()">
                            <i class="fas fa-check"></i>
                            I've Logged In
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function closeTelegramLoginInstruction(button) {
    const modal = button.closest('.modal');
    modal.remove();
}

function reopenTelegram() {
    openTelegramLink(CAMPAIGN_CONFIG.telegram.groupUrl);
}

function confirmTelegramLogin() {
    // Handle real Telegram login after user confirms
    handleRealTelegramLogin();
    
    // Close instruction modal
    const instructionModal = document.querySelector('.modal');
    if (instructionModal) {
        instructionModal.remove();
    }
}

function handleRealTelegramLogin() {
    // In production, this will receive real data from Telegram WebApp
    // For now, create a more realistic user simulation
    const user = {
        id: 'tg_user_' + Date.now(),
        first_name: 'Telegram',
        last_name: 'User',
        username: 'telegram_user_' + Math.floor(Math.random() * 10000),
        photo_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
        auth_date: Math.floor(Date.now() / 1000),
        hash: 'real_telegram_auth_' + Date.now()
    };
    
    // Save user to localStorage
    localStorage.setItem('sugar_telegram_user', JSON.stringify(user));
    localStorage.setItem('sugar_telegram_auth', 'true');
    localStorage.setItem('sugar_telegram_auth_at', new Date().toISOString());
    
    // Track successful login
    trackActivity('login_success', {
        user_id: user.id,
        username: user.username,
        login_method: 'telegram_webapp',
        is_real_telegram: true
    });
    
    // Start session tracking
    startSessionTracking(user.id);
    
    // Update UI
    showAuthenticatedUser(user);
    
    // Remove loading notification
    const loadingNotification = document.querySelector('.login-loading-notification');
    if (loadingNotification) {
        loadingNotification.remove();
    }
    
    // Show success message
    showTaskSuccess('telegram-login', 'Successfully logged in with Telegram! You can now complete tasks and earn $SUGAR tokens.');
    
    // Check for pending referral
    const pendingReferral = localStorage.getItem('sugar_pending_referral');
    if (pendingReferral) {
        localStorage.setItem('sugar_referral_code', pendingReferral);
        localStorage.removeItem('sugar_pending_referral');
        recordReferralCompletion(user.id);
    }
}

function simulateTelegramLogin() {
    // Production ready - direct authentication
    // In production, this will be replaced by real Telegram WebApp authentication
    
    // Track login attempt
    trackActivity('login_attempt', {
        method: 'telegram_webapp',
        source: 'production_platform'
    });
    
    // Check if user already exists (returning user)
    const existingUser = localStorage.getItem('sugar_telegram_user');
    let user;
    
    if (existingUser) {
        // Returning user - load existing account
        user = JSON.parse(existingUser);
        
        // Track returning user login
        trackActivity('returning_user_login', {
            user_id: user.id,
            username: user.username,
            previous_login: localStorage.getItem('sugar_telegram_auth_at'),
            login_method: 'telegram_webapp'
        });
        
        // Show welcome back message
        showWelcomeBackNotification(user);
        
    } else {
        // New user - create account
        user = {
            id: 'user_' + Date.now(),
            username: 'user_' + Math.floor(Math.random() * 10000),
            firstName: 'New',
            lastName: 'User',
            photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
            created_at: new Date().toISOString(),
            is_new_user: true,
            auth_method: 'production'
        };
        
        // Save new user to localStorage
        localStorage.setItem('sugar_telegram_user', JSON.stringify(user));
        
        // Track new user registration
        trackActivity('user_registration', {
            user_id: user.id,
            username: user.username,
            registration_method: 'production_platform',
            created_at: user.created_at
        });
        
        // Show welcome message for new user
        showWelcomeNewUserNotification(user);
    }
    
    // Update authentication status
    localStorage.setItem('sugar_telegram_auth', 'true');
    localStorage.setItem('sugar_telegram_auth_at', new Date().toISOString());
    
    // Track successful login
    trackActivity('login_success', {
        user_id: user.id,
        username: user.username,
        login_method: 'production_platform',
        is_returning_user: !user.is_new_user
    });
    
    // Start session tracking
    startSessionTracking(user.id);
    
    // Check for pending referral
    const pendingReferral = localStorage.getItem('sugar_pending_referral');
    if (pendingReferral) {
        // Process the referral
        localStorage.setItem('sugar_referral_code', pendingReferral);
        localStorage.removeItem('sugar_pending_referral');
        
        // Record referral completion
        recordReferralCompletion(user.id);
    }
    
    // Save user referral data
    saveUserReferralData();
    
    // Show authenticated user
    showAuthenticatedUser(user);
    
    // Show wallet section after login
    showWalletSection();
    
    // Show dashboard after login
    showDashboard();
    
    // Update referral UI for authenticated user
    generateReferralLink();
    
    // Show success message
    showTaskSuccess('telegram-login', 'Successfully logged in! You can now complete tasks and earn $SUGAR tokens.');
    
    // Show subscription modal for new users
    setTimeout(() => {
        showSubscriptionModal();
    }, 2000);
}

// Join Section Visibility Management
function updateJoinSectionVisibility() {
    const joinSection = document.getElementById('join');
    if (!joinSection) {
        console.log('Join section not found');
        return;
    }
    
    const isAuth = isUserAuthenticated();
    const hasWallet = localStorage.getItem('sugar_wallet_address');
    
    console.log('Join visibility check:', { isAuth, hasWallet });
    
    // Hide join section if user is authenticated AND has saved wallet (completed signup)
    if (isAuth && hasWallet) {
        joinSection.style.display = 'none';
        console.log('Join section hidden - user completed signup');
    } else {
        joinSection.style.display = 'block';
        console.log('Join section shown - user needs to complete signup');
    }
}

// Force hide join section for debugging
function forceHideJoinSection() {
    const joinSection = document.getElementById('join');
    if (joinSection) {
        joinSection.style.display = 'none';
        console.log('Join section force hidden');
    }
}

function showAuthenticatedUser(user) {
    const loginBtn = document.getElementById('login-btn');
    const userProfile = document.getElementById('user-profile');
    const userName = document.getElementById('user-name');
    const welcomeUser = document.getElementById('welcome-user');
    const dashboardNavLink = document.getElementById('dashboard-nav-link');
    
    // Hide login button, show user profile
    loginBtn.style.display = 'none';
    userProfile.style.display = 'flex';
    
    // Show dashboard navigation link
    if (dashboardNavLink) {
        dashboardNavLink.style.display = 'block';
    }
    
    // Update join section visibility based on wallet status
    updateJoinSectionVisibility();
    
    // Set user name
    const displayName = user.first_name || user.username || 'User';
    userName.textContent = displayName;
    welcomeUser.textContent = displayName;
    
    // Set user avatar (use first letter if no photo)
    const userAvatar = document.getElementById('user-avatar');
    if (user.photo_url) {
        userAvatar.innerHTML = `<img src="${user.photo_url}" alt="${displayName}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
    } else {
        userAvatar.innerHTML = displayName.charAt(0).toUpperCase();
    }
}

function showLoginRequired() {
    const loginBtn = document.getElementById('login-btn');
    const userProfile = document.getElementById('user-profile');
    const loginRequired = document.getElementById('login-required');
    const walletForm = document.getElementById('wallet-form');
    const referralSection = document.getElementById('referral-section');
    const dashboardNavLink = document.getElementById('dashboard-nav-link');
    
    // Show login button, hide user profile
    loginBtn.style.display = 'block';
    userProfile.style.display = 'none';
    
    // Hide dashboard navigation link
    if (dashboardNavLink) {
        dashboardNavLink.style.display = 'none';
    }
    
    // Show login required notice, hide wallet sections
    loginRequired.style.display = 'block';
    walletForm.style.display = 'none';
    referralSection.style.display = 'none';
    
    // Update join section visibility
    updateJoinSectionVisibility();
}

function showWalletSection() {
    const loginRequired = document.getElementById('login-required');
    const walletForm = document.getElementById('wallet-form');
    const referralSection = document.getElementById('referral-section');
    
    // Hide login required notice, show wallet sections
    loginRequired.style.display = 'none';
    walletForm.style.display = 'block';
    referralSection.style.display = 'block';
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear Telegram user data
        localStorage.removeItem('sugar_telegram_user');
        localStorage.removeItem('sugar_telegram_login_at');
        
        // Reset UI
        showLoginRequired();
        
        // Track logout event
        trackEvent('telegram_logout');
        
        // Show logout message
        showTaskSuccess('telegram-logout', 'You have been logged out successfully.');
    }
}

// Check if user is authenticated
function isUserAuthenticated() {
    return localStorage.getItem('sugar_telegram_user') !== null;
}

// Get current user data
function getCurrentUser() {
    const userData = localStorage.getItem('sugar_telegram_user');
    return userData ? JSON.parse(userData) : null;
}

// Save wallet address (updated to require authentication)
function saveWalletAddress() {
    // Check if user is authenticated
    if (!isUserAuthenticated()) {
        showStatus('error', 'Please login with Telegram first!');
        showTelegramLogin();
        return;
    }
    
    const walletInput = document.getElementById('wallet-address');
    const statusDiv = document.getElementById('wallet-status');
    const walletAddress = walletInput.value.trim();
    
    // Clear previous status
    statusDiv.className = 'status-message';
    statusDiv.style.display = 'none';
    
    // Check if wallet is already saved
    const existingWallet = localStorage.getItem('sugar_wallet_address');
    if (existingWallet) {
        showStatus('error', 'Wallet address already saved. You can only save one wallet address.');
        return;
    }
    
    // Validate wallet address
    if (!walletAddress) {
        showStatus('error', 'Please enter a Solana wallet address');
        return;
    }
    
    if (!isValidSolanaAddress(walletAddress)) {
        showStatus('error', 'Invalid Solana wallet address format. Please check and try again.');
        return;
    }
    
    // Save to localStorage with user association
    try {
        const currentUser = getCurrentUser();
        localStorage.setItem('sugar_wallet_address', walletAddress);
        localStorage.setItem('sugar_wallet_saved_at', new Date().toISOString());
        localStorage.setItem('sugar_wallet_user_id', currentUser.id.toString());
        
        showStatus('success', 'Wallet address saved successfully! You can now start earning $SUGAR tokens.');
        
        // Update join section visibility after wallet save
        updateJoinSectionVisibility();
        
        // Update referral link with user ID
        generateReferralLink(walletAddress);
        
        // Disable input and button after successful save
        walletInput.disabled = true;
        walletInput.value = walletAddress + ' (saved)';
        const saveButton = walletInput.nextElementSibling;
        saveButton.disabled = true;
        saveButton.innerHTML = '<i class="fas fa-check"></i> Saved';
        
        // Track wallet save event
        trackEvent('wallet_saved', { 
            wallet_length: walletAddress.length,
            user_id: currentUser.id 
        });
        
    } catch (error) {
        console.error('Error saving wallet address:', error);
        showStatus('error', 'Failed to save wallet address. Please try again.');
    }
}

// Load saved wallet address
function loadSavedWallet() {
    try {
        const savedWallet = localStorage.getItem('sugar_wallet_address');
        const savedAt = localStorage.getItem('sugar_wallet_saved_at');
        
        if (savedWallet) {
            console.log('Found saved wallet:', savedWallet.substring(0, 8) + '...');
            
            // Update UI to show saved wallet
            const walletInput = document.getElementById('wallet-address');
            const saveButton = walletInput.nextElementSibling;
            
            if (walletInput) {
                walletInput.value = savedWallet;
                walletInput.disabled = true;
            }
            
            if (saveButton) {
                saveButton.disabled = true;
                saveButton.innerHTML = '<i class="fas fa-check"></i> Saved';
            }
            
            generateReferralLink(savedWallet);
            
            // Show saved date if available
            if (savedAt) {
                const savedDate = new Date(savedAt);
                console.log('Wallet saved on:', savedDate.toLocaleDateString());
            }
        }
    } catch (error) {
        console.error('Error loading saved wallet:', error);
    }
}

// Load saved wallet in hero section
function loadHeroWallet() {
    try {
        const savedWallet = localStorage.getItem('sugar_wallet_address');
        const heroWalletInput = document.getElementById('hero-wallet-address');
        
        if (savedWallet && heroWalletInput) {
            heroWalletInput.value = savedWallet;
            heroWalletInput.disabled = true;
            
            const saveBtn = heroWalletInput.nextElementSibling;
            if (saveBtn) {
                saveBtn.disabled = true;
                saveBtn.innerHTML = '<i class="fas fa-check"></i> Saved';
            }
            
            // Show success status
            showHeroWalletStatus('Wallet address already saved! You can login with Telegram to access your dashboard.', 'success');
        }
    } catch (error) {
        console.error('Error loading hero wallet:', error);
    }
}

// Generate referral link
function generateReferralLink() {
    if (!isUserAuthenticated()) {
        const referralInput = document.getElementById('referral-link');
        if (referralInput) {
            referralInput.value = 'Please login to get your referral link';
        }
        return;
    }
    
    const currentUser = getCurrentUser();
    const userId = currentUser.id;
    
    // Check if user already has referral data
    let referralData = getUserReferralData(userId);
    
    if (!referralData) {
        // Create new referral data for this user
        referralData = saveUserReferralData(userId);
    }
    
    // Update UI with referral link
    updateReferralUI(userId);
}

// Referral System Functions
function generateUserReferralLink(userId) {
    // Use your actual bot for referral links
    return `https://t.me/${TELEGRAM_BOT_USERNAME}?ref=${userId}`;
}

function generateReferralCode(userId) {
    // Generate a unique referral code based on user ID and timestamp
    const timestamp = Date.now().toString(36);
    const userHash = btoa(userId.toString()).substring(0, 8);
    return `${userHash}-${timestamp}`.toUpperCase();
}

function saveUserReferralData(userId) {
    const referralCode = generateReferralCode(userId);
    const referralLink = generateUserReferralLink(referralCode);
    
    // Save referral data for this user
    localStorage.setItem(`sugar_referral_code_${userId}`, referralCode);
    localStorage.setItem(`sugar_referral_link_${userId}`, referralLink);
    localStorage.setItem(`sugar_referral_data_${userId}`, JSON.stringify({
        code: referralCode,
        link: referralLink,
        createdAt: new Date().toISOString(),
        referrals: [],
        totalEarned: 0
    }));
    
    return { referralCode, referralLink };
}

function getUserReferralData(userId) {
    const referralData = localStorage.getItem(`sugar_referral_data_${userId}`);
    return referralData ? JSON.parse(referralData) : null;
}

function checkReferralParameter() {
    const urlParams = new URLSearchParams(window.location.search);
    const referralCode = urlParams.get('ref');
    
    if (referralCode) {
        // Store the referral code for this session
        sessionStorage.setItem('sugar_referrer_code', referralCode);
        
        // Track referral visit
        trackEvent('referral_visit', { referral_code: referralCode });
        
        // Show referral notification
        showReferralNotification(referralCode);
    }
}

function showReferralNotification(referralCode) {
    // Create notification for referred user
    const notification = document.createElement('div');
    notification.className = 'referral-notification show';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-gift"></i>
            <div class="notification-text">
                <h4>Welcome!</h4>
                <p>You've been invited to join $SUGAR! Complete tasks to earn rewards.</p>
            </div>
            <button class="notification-close" onclick="closeReferralNotification(this)">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        const notification = document.querySelector('.referral-notification');
        if (notification) {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

function closeReferralNotification(button) {
    const notification = button.closest('.referral-notification');
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
}

function recordReferralCompletion(newUserId) {
    const referrerCode = sessionStorage.getItem('sugar_referrer_code');
    
    if (!referrerCode) return;
    
    // Find the referrer by their code
    const referrerData = findUserByReferralCode(referrerCode);
    
    if (referrerData) {
        // Check if this referral was already recorded
        const existingReferral = referrerData.referrals.find(r => r.referredUserId === newUserId);
        if (existingReferral) {
            return; // Already recorded this referral
        }
        
        // Add referral to referrer's data (pending until both subscriptions completed)
        const referralInfo = {
            referredUserId: newUserId,
            referredAt: new Date().toISOString(),
            reward: CAMPAIGN_CONFIG.rewards.referral,
            status: 'pending', // Will be 'completed' when both group and channel are subscribed
            groupSubscribed: false,
            channelSubscribed: false
        };
        
        referrerData.referrals.push(referralInfo);
        
        // Save updated referrer data
        localStorage.setItem(`sugar_referral_data_${referrerData.userId}`, JSON.stringify(referrerData));
        
        // Track referral initiation
        trackEvent('referral_initiated', {
            referrer_id: referrerData.userId,
            referred_user_id: newUserId,
            pending_reward: referralInfo.reward
        });
        
        // Show notification to referrer (if they're online)
        if (getCurrentUser() && getCurrentUser().id === referrerData.userId) {
            showTaskSuccess('referral-initiated', `Someone joined using your referral link! They need to complete both group and channel subscriptions for you to earn ${CAMPAIGN_CONFIG.rewards.referral} $SUGAR.`);
        }
    }
}

function checkReferralCompletion(userId) {
    // Check if user has completed both subscriptions and update referrer
    const groupSubscribed = localStorage.getItem(`sugar_group_subscribed_${userId}`) === 'true';
    const channelSubscribed = localStorage.getItem(`sugar_channel_subscribed_${userId}`) === 'true';
    
    if (!groupSubscribed || !channelSubscribed) {
        return; // Not both completed yet
    }
    
    // Find if this user was referred
    const referrerCode = sessionStorage.getItem('sugar_referrer_code');
    if (!referrerCode) return;
    
    const referrerData = findUserByReferralCode(referrerCode);
    if (!referrerData) return;
    
    // Find the referral record
    const referralRecord = referrerData.referrals.find(r => r.referredUserId === userId);
    if (!referralRecord || referralRecord.status === 'completed') {
        return; // Already completed or not found
    }
    
    // Mark referral as completed
    referralRecord.status = 'completed';
    referralRecord.groupSubscribed = true;
    referralRecord.channelSubscribed = true;
    referralRecord.completedAt = new Date().toISOString();
    
    // Update referrer's total earned
    referrerData.totalEarned += referralRecord.reward;
    
    // Save updated referrer data
    localStorage.setItem(`sugar_referral_data_${referrerData.userId}`, JSON.stringify(referrerData));
    
    // Update referral count
    const currentCount = localStorage.getItem(`sugar_referral_count_${referrerData.userId}`) || '0';
    localStorage.setItem(`sugar_referral_count_${referrerData.userId}`, (parseInt(currentCount) + 1).toString());
    
    // Track successful referral
    trackEvent('successful_referral', {
        referrer_id: referrerData.userId,
        referred_user_id: userId,
        reward: referralRecord.reward
    });
    
    // Show success message to referrer (if they're online)
    if (getCurrentUser() && getCurrentUser().id === referrerData.userId) {
        showTaskSuccess('referral-success', `Your referral completed both group and channel subscriptions! +${CAMPAIGN_CONFIG.rewards.referral} $SUGAR will be distributed at campaign end.`);
        
        // Recalculate pending rewards immediately for referrer
        calculatePendingRewards();
        
        // Update eligibility and reward messages for referrer
        updateRewardMessages();
    }
    
    // Clear referral code from session
    sessionStorage.removeItem('sugar_referrer_code');
}

function findUserByReferralCode(referralCode) {
    // Find user who owns this referral code
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('sugar_referral_data_')) {
            const data = JSON.parse(localStorage.getItem(key));
            if (data.code === referralCode) {
                const userId = key.replace('sugar_referral_data_', '');
                return { ...data, userId: parseInt(userId) };
            }
        }
    }
    return null;
}

function updateReferralUI(userId) {
    const referralData = getUserReferralData(userId);
    
    if (referralData) {
        // Update referral link display
        const referralLinkElement = document.getElementById('referral-link');
        if (referralLinkElement) {
            referralLinkElement.value = referralData.link;
        }
        
        // Update referral stats
        const referralCountElement = document.getElementById('referral-count');
        if (referralCountElement) {
            const completedReferrals = referralData.referrals.filter(r => r.status === 'completed');
            referralCountElement.textContent = `${completedReferrals.length} completed`;
        }
        
        const referralEarningsElement = document.getElementById('referral-earnings');
        if (referralEarningsElement) {
            referralEarningsElement.textContent = referralData.totalEarned;
        }
    }
}

// Generate unique user ID
function generateUserId() {
    // Generate a random 8-character ID
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Copy referral link
function copyReferralLink() {
    const referralInput = document.getElementById('referral-link');
    
    try {
        referralInput.select();
        referralInput.setSelectionRange(0, 99999); // For mobile devices
        
        const successful = document.execCommand('copy');
        
        if (successful) {
            // Show success feedback
            const button = event.target.closest('button');
            const originalHTML = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i> Copied!';
            button.style.background = 'var(--secondary-color)';
            
            setTimeout(() => {
                button.innerHTML = originalHTML;
                button.style.background = '';
            }, 2000);
            
            // Track copy event
            trackEvent('referral_copied');
        } else {
            // Fallback for modern browsers
            navigator.clipboard.writeText(referralInput.value).then(() => {
                const button = event.target.closest('button');
                const originalHTML = button.innerHTML;
                button.innerHTML = '<i class="fas fa-check"></i> Copied!';
                button.style.background = 'var(--secondary-color)';
                
                setTimeout(() => {
                    button.innerHTML = originalHTML;
                    button.style.background = '';
                }, 2000);
                
                trackEvent('referral_copied');
            }).catch(err => {
                console.error('Failed to copy referral link:', err);
                alert('Failed to copy referral link. Please copy manually.');
            });
        }
    } catch (error) {
        console.error('Error copying referral link:', error);
        alert('Failed to copy referral link. Please copy manually.');
    }
}

// Check for referral parameter in URL
function checkReferralParameter() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const refCode = urlParams.get('ref');
        
        if (refCode) {
            console.log('Referral code found:', refCode);
            localStorage.setItem('sugar_referral_code', refCode);
            
            // Show referral welcome message
            showReferralWelcome(refCode);
            
            // Track referral visit
            trackEvent('referral_visit', { ref_code: refCode });
        }
    } catch (error) {
        console.error('Error checking referral parameter:', error);
    }
}

// Show referral welcome message
function showReferralWelcome(refCode) {
    const joinContainer = document.querySelector('.join-container');
    if (joinContainer) {
        const welcomeDiv = document.createElement('div');
        welcomeDiv.className = 'referral-welcome';
        welcomeDiv.style.cssText = `
            background: linear-gradient(135deg, rgba(78, 205, 196, 0.1), rgba(68, 160, 141, 0.1));
            border: 1px solid var(--secondary-color);
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 30px;
            text-align: center;
        `;
        welcomeDiv.innerHTML = `
            <h3 style="color: var(--secondary-color); margin-bottom: 10px;">
                <i class="fas fa-gift"></i> Welcome Referred User!
            </h3>
            <p style="color: var(--text-secondary);">
                You were referred by <strong>${refCode.substring(0, 8)}...</strong>. 
                Both you and your referrer will earn bonus $SUGAR tokens!
            </p>
        `;
        
        joinContainer.insertBefore(welcomeDiv, joinContainer.firstChild);
    }
}

// Show status message
function showStatus(type, message) {
    const statusDiv = document.getElementById('wallet-status');
    if (statusDiv) {
        statusDiv.className = `status-message ${type}`;
        statusDiv.textContent = message;
        statusDiv.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 5000);
    }
}

// Show wallet status message (for join section)
function showWalletStatus(type, message) {
    const statusDiv = document.getElementById('wallet-status');
    if (statusDiv) {
        statusDiv.className = `status-message ${type}`;
        statusDiv.textContent = message;
        statusDiv.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 5000);
    }
}

// Smooth scrolling
function addSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Input validation
function addInputValidation() {
    const walletInput = document.getElementById('wallet-address');
    if (walletInput) {
        walletInput.addEventListener('input', function() {
            const value = this.value.trim();
            if (value && !isValidSolanaAddress(value)) {
                this.style.borderColor = 'var(--primary-color)';
            } else {
                this.style.borderColor = '';
            }
        });
        
        walletInput.addEventListener('paste', function(e) {
            setTimeout(() => {
                const value = this.value.trim();
                if (value && isValidSolanaAddress(value)) {
                    this.style.borderColor = 'var(--secondary-color)';
                }
            }, 100);
        });
    }
}

// Scroll to join section
function scrollToJoin() {
    const joinSection = document.getElementById('join');
    if (joinSection) {
        joinSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Scroll to wallet section
function scrollToWallet() {
    const walletSection = document.getElementById('wallet-form');
    if (walletSection) {
        walletSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
        
        // Highlight the section briefly
        walletSection.classList.add('highlight');
        setTimeout(() => {
            walletSection.classList.remove('highlight');
        }, 2000);
    }
}

// Show how it works
function showHowItWorks() {
    const howItWorks = document.getElementById('how-it-works');
    if (howItWorks) {
        howItWorks.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Analytics tracking (placeholder)
function trackEvent(eventName, data = {}) {
    console.log('Event tracked:', eventName, data);
    // In a real implementation, this would send data to analytics service
    // Example: gtag('event', eventName, data);
}

// Clear wallet data (for testing)
function clearWalletData() {
    localStorage.removeItem('sugar_wallet_address');
    localStorage.removeItem('sugar_wallet_saved_at');
    localStorage.removeItem('sugar_referral_code');
    location.reload();
}

// Telegram Link Handler
function openTelegramLink(url) {
    // Check if this is a Telegram link
    if (url.includes('t.me/')) {
        // Show Telegram app prompt
        showTelegramAppPrompt(url);
    } else {
        // Open regular link
        window.open(url, '_blank');
    }
}

function showTelegramAppPrompt(telegramUrl) {
    // Create modal for Telegram app choice
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Open with Telegram</h3>
                <button class="modal-close" onclick="closeTelegramPrompt(this)">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="telegram-prompt">
                    <div class="prompt-icon">
                        <i class="fab fa-telegram"></i>
                    </div>
                    <h4>Choose how to open this link</h4>
                    <p>This is a Telegram link. You can open it with the Telegram app for the best experience.</p>
                    
                    <div class="prompt-options">
                        <button class="btn btn-primary" onclick="openInTelegramApp('${telegramUrl}')">
                            <i class="fab fa-telegram"></i>
                            Open in Telegram App
                        </button>
                        <button class="btn btn-secondary" onclick="openInBrowser('${telegramUrl}')">
                            <i class="fas fa-globe"></i>
                            Open in Browser
                        </button>
                    </div>
                    
                    <div class="prompt-info">
                        <p><strong>Recommended:</strong> Use the Telegram app for full functionality</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function closeTelegramPrompt(button) {
    const modal = button.closest('.modal');
    modal.remove();
}

function openInTelegramApp(url) {
    // Try to open with Telegram app protocol
    const telegramAppUrl = url.replace('https://t.me/', 'tg://resolve?domain=');
    
    // Try to open Telegram app
    window.location.href = telegramAppUrl;
    
    // Fallback to browser after a short delay
    setTimeout(() => {
        window.open(url, '_blank');
    }, 1000);
    
    // Close the prompt
    const promptModal = document.querySelector('.modal');
    if (promptModal) {
        promptModal.remove();
    }
}

function openInBrowser(url) {
    window.open(url, '_blank');
    
    // Close the prompt
    const promptModal = document.querySelector('.modal');
    if (promptModal) {
        promptModal.remove();
    }
}

// Check user eligibility for rewards
function checkUserEligibility(userId) {
    if (!userId) return false;
    
    let hasRequiredSubscriptions = true;
    
    // Check group subscription
    const groupSubscribed = localStorage.getItem(`sugar_group_subscribed_${userId}`) === 'true';
    if (!groupSubscribed) hasRequiredSubscriptions = false;
    
    // Check channel subscription
    const channelSubscribed = localStorage.getItem(`sugar_channel_subscribed_${userId}`) === 'true';
    if (!channelSubscribed) hasRequiredSubscriptions = false;
    
    // Calculate user's cumulative $SUGAR amount
    let totalAmount = 0;
    
    // Check Telegram task reward
    const telegramCompleted = localStorage.getItem(`sugar_telegram_task_completed_${userId}`) === 'true';
    if (telegramCompleted) {
        totalAmount += CAMPAIGN_CONFIG.rewards.telegramJoin;
    }
    
    // Check subscription rewards
    if (groupSubscribed) {
        totalAmount += CAMPAIGN_CONFIG.rewards.groupSubscription;
    }
    
    if (channelSubscribed) {
        totalAmount += CAMPAIGN_CONFIG.rewards.channelSubscription;
    }
    
    // Check engagement rewards
    const engagementData = localStorage.getItem(`sugar_engagement_${userId}`);
    if (engagementData) {
        const data = JSON.parse(engagementData);
        const reactionRewards = (data.reactions || 0) * CAMPAIGN_CONFIG.rewards.reaction;
        const engagementRewards = (data.engagements || 0) * CAMPAIGN_CONFIG.rewards.engagement;
        totalAmount += reactionRewards + engagementRewards;
    }
    
    // Check referral rewards (only completed referrals count)
    const referralData = getUserReferralData(userId);
    if (referralData) {
        const completedReferrals = referralData.referrals.filter(r => r.status === 'completed');
        totalAmount += completedReferrals.length * CAMPAIGN_CONFIG.rewards.referral;
    }
    
    // Check if user meets minimum amount requirement
    const isEligible = totalAmount >= CAMPAIGN_CONFIG.eligibility.minAmount && hasRequiredSubscriptions;
    
    return {
        eligible: isEligible,
        totalAmount: totalAmount,
        hasRequiredSubscriptions: hasRequiredSubscriptions,
        amountNeeded: Math.max(0, CAMPAIGN_CONFIG.eligibility.minAmount - totalAmount),
        progress: Math.min(100, (totalAmount / CAMPAIGN_CONFIG.eligibility.minAmount) * 100)
    };
}

// Update reward messages to include eligibility information
function updateRewardMessages() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const eligibility = checkUserEligibility(currentUser.id);
    
    // Update pending rewards message
    const pendingRewardsElement = document.querySelector('.total-earnings p');
    if (pendingRewardsElement) {
        if (eligibility.eligible) {
            pendingRewardsElement.textContent = `Congratulations! You've accumulated ${eligibility.totalAmount.toLocaleString()} $SUGAR and are eligible for the airdrop! 10,000,000,000 $SUGAR reward pool will be distributed at campaign end.`;
            pendingRewardsElement.style.color = 'var(--accent-color)';
        } else {
            pendingRewardsElement.textContent = `You need ${eligibility.amountNeeded.toLocaleString()} more $SUGAR to reach the 10,000 minimum for airdrop eligibility. Current: ${eligibility.totalAmount.toLocaleString()} $SUGAR (${eligibility.progress.toFixed(1)}%) - 10,000,000,000 $SUGAR total reward pool`;
            pendingRewardsElement.style.color = 'var(--text-secondary)';
        }
    }
    
    // Update progress bar if it exists
    updateEligibilityProgress(eligibility);
}

function updateEligibilityProgress(eligibility) {
    // Create or update progress bar for 10,000 $SUGAR goal
    let progressContainer = document.getElementById('eligibility-progress');
    
    if (!progressContainer) {
        // Create progress container if it doesn't exist
        progressContainer = document.createElement('div');
        progressContainer.id = 'eligibility-progress';
        progressContainer.className = 'eligibility-progress';
        
        // Insert after the total earnings card
        const earningsCard = document.querySelector('.total-earnings');
        if (earningsCard) {
            earningsCard.parentNode.insertBefore(progressContainer, earningsCard.nextSibling);
        }
    }
    
    progressContainer.innerHTML = `
        <h4>Airdrop Eligibility Progress</h4>
        <div class="progress-bar-container">
            <div class="progress-info">
                <span class="progress-amount">${eligibility.totalAmount.toLocaleString()} / 10,000 $SUGAR</span>
                <span class="progress-percentage">${eligibility.progress.toFixed(1)}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${eligibility.progress}%"></div>
            </div>
            <div class="progress-status ${eligibility.eligible ? 'eligible' : 'pending'}">
                ${eligibility.eligible ? 
                    '<i class="fas fa-check-circle"></i> Eligible for Airdrop!' : 
                    `<i class="fas fa-clock"></i> Need ${eligibility.amountNeeded.toLocaleString()} more $SUGAR`
                }
            </div>
        </div>
    `;
}

// Subscription Management Functions
function showSubscriptionModal() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    // Check current subscription status
    const groupSubscribed = localStorage.getItem(`sugar_group_subscribed_${currentUser.id}`) === 'true';
    const channelSubscribed = localStorage.getItem(`sugar_channel_subscribed_${currentUser.id}`) === 'true';
    
    // Create subscription modal
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Subscribe to Our Community</h3>
                <button class="modal-close" onclick="closeSubscriptionModal(this)">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="subscription-options">
                    <h4>Join our Telegram Group and Channel to earn rewards!</h4>
                    <div class="subscription-cards">
                        <div class="subscription-card ${groupSubscribed ? 'subscribed' : ''}" id="group-card">
                            <div class="card-header">
                                <i class="fab fa-telegram"></i>
                                <h5>Telegram Group</h5>
                            </div>
                            <div class="card-content">
                                <p>Join our community group for discussions and updates</p>
                                <div class="reward-info">
                                    <span class="reward-amount">+${CAMPAIGN_CONFIG.rewards.groupSubscription}</span>
                                    <span class="reward-token">$SUGAR</span>
                                </div>
                            </div>
                            <div class="card-action">
                                ${groupSubscribed ? 
                                    '<button class="btn btn-secondary" disabled><i class="fas fa-check"></i> Subscribed</button>' :
                                    `<button class="btn btn-primary" onclick="subscribeToGroup()"><i class="fas fa-user-plus"></i> Join Group</button>`
                                }
                            </div>
                        </div>
                        
                        <div class="subscription-card ${channelSubscribed ? 'subscribed' : ''}" id="channel-card">
                            <div class="card-header">
                                <i class="fas fa-bullhorn"></i>
                                <h5>Telegram Channel</h5>
                            </div>
                            <div class="card-content">
                                <p>Subscribe to our channel for announcements and news</p>
                                <div class="reward-info">
                                    <span class="reward-amount">+${CAMPAIGN_CONFIG.rewards.channelSubscription}</span>
                                    <span class="reward-token">$SUGAR</span>
                                </div>
                            </div>
                            <div class="card-action">
                                ${channelSubscribed ? 
                                    '<button class="btn btn-secondary" disabled><i class="fas fa-check"></i> Subscribed</button>' :
                                    `<button class="btn btn-primary" onclick="subscribeToChannel()"><i class="fas fa-bell"></i> Subscribe</button>`
                                }
                            </div>
                        </div>
                    </div>
                    <div class="subscription-info">
                        <p><strong>Total Potential Rewards:</strong> ${CAMPAIGN_CONFIG.rewards.groupSubscription + CAMPAIGN_CONFIG.rewards.channelSubscription} $SUGAR</p>
                        <p>All rewards will be distributed at campaign end</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function closeSubscriptionModal(button) {
    const modal = button.closest('.modal');
    modal.remove();
}

function subscribeToGroup() {
    // Check if user is authenticated first
    if (!isUserAuthenticated()) {
        showLoginRequiredNotification('Please login with Telegram first before subscribing to the group!');
        showTelegramLogin();
        return;
    }
    
    // Check if wallet is saved
    const savedWallet = localStorage.getItem('sugar_wallet_address');
    if (!savedWallet) {
        showLoginRequiredNotification('Please save your wallet address first before subscribing to the group!');
        scrollToWallet();
        return;
    }
    
    const currentUser = getCurrentUser();
    const userId = currentUser.id;
    
    // Check if already subscribed
    const isSubscribed = localStorage.getItem(`sugar_group_subscribed_${userId}`) === 'true';
    if (isSubscribed) {
        alert('You are already subscribed to the group!');
        return;
    }
    
    // Track subscription start
    trackActivity('subscription_start', {
        subscription_type: 'group',
        target: CAMPAIGN_CONFIG.telegram.groupUrl
    });
    
    // Show subscription modal
    showSubscriptionModal('group');
    
    // Simulate subscription check after delay
    setTimeout(() => {
        // Mark as subscribed
        localStorage.setItem(`sugar_group_subscribed_${userId}`, 'true');
        localStorage.setItem(`sugar_group_subscribed_at_${userId}`, new Date().toISOString());
        
        // Track successful subscription
        trackActivity('subscription_completion', {
            subscription_type: 'group',
            target: CAMPAIGN_CONFIG.telegram.groupUrl,
            reward: CAMPAIGN_CONFIG.rewards.groupSubscription
        });
        
        // Update UI
        updateSubscriptionUI('group', true);
        
        // Show success message
        showTaskSuccess('group-subscription', `Group subscription confirmed! +${CAMPAIGN_CONFIG.rewards.groupSubscription} $SUGAR will be distributed at campaign end.`);
        
        // Recalculate pending rewards immediately
        calculatePendingRewards();
        
        // Update eligibility and reward messages
        updateRewardMessages();
        
        // Update dashboard in real-time if user is authenticated
        if (isUserAuthenticated()) {
            updateDashboardData();
        }
        
        // Check if this completes a referral
        checkReferralCompletion(currentUser.id);
        
        // Track subscription event
        trackEvent('group_subscription', { 
            user_id: currentUser.id,
            pending_reward: CAMPAIGN_CONFIG.rewards.groupSubscription
        });
    }, 2000);
}

function subscribeToChannel() {
    // Check if user is authenticated first
    if (!isUserAuthenticated()) {
        showLoginRequiredNotification('Please login with Telegram first before subscribing to the channel!');
        showTelegramLogin();
        return;
    }
    
    // Check if wallet is saved
    const savedWallet = localStorage.getItem('sugar_wallet_address');
    if (!savedWallet) {
        showLoginRequiredNotification('Please save your wallet address first before subscribing to the channel!');
        scrollToWallet();
        return;
    }
    
    const currentUser = getCurrentUser();
    const userId = currentUser.id;
    
    // Check if already subscribed
    const isSubscribed = localStorage.getItem(`sugar_channel_subscribed_${userId}`) === 'true';
    if (isSubscribed) {
        alert('You are already subscribed to the channel!');
        return;
    }
    
    // Track subscription start
    trackActivity('subscription_start', {
        subscription_type: 'channel',
        target: CAMPAIGN_CONFIG.telegram.channelUrl
    });
    
    // Open Telegram channel in new window
    openTelegramLink(CAMPAIGN_CONFIG.telegram.channelUrl);
    
    // Show confirmation dialog
    setTimeout(() => {
        const confirmed = confirm('Have you subscribed to our Telegram channel? Click OK to confirm your subscription!');
        
        if (confirmed) {
            // Mark as subscribed
            localStorage.setItem(`sugar_channel_subscribed_${userId}`, 'true');
            localStorage.setItem(`sugar_channel_subscribed_at_${userId}`, new Date().toISOString());
            
            // Track successful subscription
            trackActivity('subscription_completion', {
                subscription_type: 'channel',
                target: CAMPAIGN_CONFIG.telegram.channelUrl,
                reward: CAMPAIGN_CONFIG.rewards.channelSubscription
            });
            
            // Update UI
            updateSubscriptionUI('channel', true);
            
            // Show success message
            showTaskSuccess('channel-subscription', `Channel subscription confirmed! +${CAMPAIGN_CONFIG.rewards.channelSubscription} $SUGAR will be distributed at campaign end.`);
            
            // Recalculate pending rewards immediately
            calculatePendingRewards();
            
            // Update eligibility and reward messages
            updateRewardMessages();
            
            // Update dashboard in real-time if user is authenticated
            if (isUserAuthenticated()) {
                updateDashboardData();
            }
            
            // Check if this completes a referral
            checkReferralCompletion(currentUser.id);
            
            // Track subscription event
            trackEvent('channel_subscription', { 
                user_id: currentUser.id,
                pending_reward: CAMPAIGN_CONFIG.rewards.channelSubscription
            });
        }
    }, 2000);
}

function updateSubscriptionUI(type, subscribed) {
    const cardId = type === 'group' ? 'group-card' : 'channel-card';
    const card = document.getElementById(cardId);
    
    if (card && subscribed) {
        card.classList.add('subscribed');
        const actionDiv = card.querySelector('.card-action');
        actionDiv.innerHTML = '<button class="btn btn-secondary" disabled><i class="fas fa-check"></i> Subscribed</button>';
    }
}

function checkSubscriptionStatus() {
    if (!isUserAuthenticated()) return;
    
    const currentUser = getCurrentUser();
    const userId = currentUser.id;
    
    const groupSubscribed = localStorage.getItem(`sugar_group_subscribed_${userId}`) === 'true';
    const channelSubscribed = localStorage.getItem(`sugar_channel_subscribed_${userId}`) === 'true';
    
    // Update main task UI if both are subscribed
    if (groupSubscribed && channelSubscribed) {
        updateTelegramTaskUI(true);
    }
}
function updateCampaignEndDate() {
    const endDateElement = document.getElementById('campaign-end-date');
    if (endDateElement) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        endDateElement.textContent = CAMPAIGN_CONFIG.endDate.toLocaleDateString('en-US', options);
    }
}

function startCountdownTimer() {
    updateCountdown();
    // Update every second
    setInterval(updateCountdown, 1000);
}

function updateCountdown() {
    const now = new Date().getTime();
    const endTime = CAMPAIGN_CONFIG.endDate.getTime();
    const timeLeft = endTime - now;

    if (timeLeft > 0) {
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        let countdownText = '';
        if (days > 0) {
            countdownText = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        } else if (hours > 0) {
            countdownText = `${hours}h ${minutes}m ${seconds}s`;
        } else if (minutes > 0) {
            countdownText = `${minutes}m ${seconds}s`;
        } else {
            countdownText = `${seconds}s`;
        }

        const countdownElement = document.getElementById('campaign-countdown');
        if (countdownElement) {
            countdownElement.textContent = countdownText;
            
            // Add urgency styling if less than 24 hours
            if (days === 0 && hours < 24) {
                countdownElement.style.color = '#FF6B6B';
                countdownElement.style.animation = 'pulse 1s infinite';
            }
        }
    } else {
        // Campaign has ended
        const countdownElement = document.getElementById('campaign-countdown');
        if (countdownElement) {
            countdownElement.textContent = 'Campaign Ended';
            countdownElement.style.color = '#FF6B6B';
        }
        
        // Disable all task completion
        disableAllTasks();
    }
}

function disableAllTasks() {
    // Disable all task buttons when campaign ends
    const taskButtons = document.querySelectorAll('.task-action button:not(:disabled)');
    taskButtons.forEach(button => {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-lock"></i> Campaign Ended';
    });
}

function calculatePendingRewards() {
    if (!isUserAuthenticated()) return;
    
    const currentUser = getCurrentUser();
    const userId = currentUser.id;
    
    let totalPending = 0;
    
    // Check Telegram task reward
    const telegramCompleted = localStorage.getItem(`sugar_telegram_task_completed_${userId}`);
    if (telegramCompleted === 'true') {
        totalPending += CAMPAIGN_CONFIG.rewards.telegramJoin;
    }
    
    // Check subscription rewards
    const groupSubscribed = localStorage.getItem(`sugar_group_subscribed_${userId}`) === 'true';
    const channelSubscribed = localStorage.getItem(`sugar_channel_subscribed_${userId}`) === 'true';
    
    if (groupSubscribed) {
        totalPending += CAMPAIGN_CONFIG.rewards.groupSubscription;
    }
    
    if (channelSubscribed) {
        totalPending += CAMPAIGN_CONFIG.rewards.channelSubscription;
    }
    
    // Check engagement rewards
    const engagementData = localStorage.getItem(`sugar_engagement_${userId}`);
    if (engagementData) {
        const data = JSON.parse(engagementData);
        const reactionRewards = (data.reactions || 0) * CAMPAIGN_CONFIG.rewards.reaction;
        const engagementRewards = (data.engagements || 0) * CAMPAIGN_CONFIG.rewards.engagement;
        totalPending += reactionRewards + engagementRewards;
    }
    
    // Check referral rewards (only completed referrals count)
    const referralData = getUserReferralData(userId);
    if (referralData) {
        const completedReferrals = referralData.referrals.filter(r => r.status === 'completed');
        totalPending += completedReferrals.length * CAMPAIGN_CONFIG.rewards.referral;
    }
    
    // Update UI
    updatePendingRewardsUI(totalPending);
}

function updatePendingRewardsUI(amount) {
    const pendingRewardsElement = document.getElementById('pending-rewards');
    const pendingEarningsElement = document.getElementById('pending-earnings');
    const pendingUsdElement = document.getElementById('pending-usd');
    
    if (pendingRewardsElement) {
        pendingRewardsElement.textContent = amount.toLocaleString();
    }
    
    if (pendingEarningsElement) {
        pendingEarningsElement.textContent = amount.toLocaleString();
    }
    
    // Calculate and display USD equivalent
    const usdEquivalent = amount * CAMPAIGN_CONFIG.tokenValue;
    if (pendingUsdElement) {
        pendingUsdElement.textContent = `($${usdEquivalent.toFixed(4)})`;
    }
}

// Complete Telegram task (updated for campaign-end rewards)
function completeTelegramTask() {
    // Check if user is authenticated first
    if (!isUserAuthenticated()) {
        showLoginRequiredNotification('Please login with Telegram first before completing tasks!');
        showTelegramLogin();
        return;
    }
    
    // Check if wallet is saved
    const savedWallet = localStorage.getItem('sugar_wallet_address');
    if (!savedWallet) {
        showLoginRequiredNotification('Please save your wallet address first before completing tasks!');
        scrollToWallet();
        return;
    }
    
    const currentUser = getCurrentUser();
    const userId = currentUser.id;
    
    // Check if task is already completed
    const taskCompleted = localStorage.getItem(`sugar_telegram_task_completed_${userId}`);
    if (taskCompleted === 'true') {
        alert('You have already completed this task!');
        return;
    }
    
    // Track task start
    trackActivity('task_start', {
        task_type: 'telegram_join',
        task_id: 'telegram_task'
    });
    
    // Open Telegram in new window
    const WEBAPP_URL = 'https://sugar-token-platform--YOUR_NEW_USERNAME.replit.app';
    const telegramUrl = 'https://t.me/sugar_token';
    window.open(telegramUrl, '_blank');
    
    // Show confirmation dialog
    setTimeout(() => {
        const confirmed = confirm('Have you joined the Telegram group? Click OK to confirm your participation!');
        
        if (confirmed) {
            // Mark task as completed
            localStorage.setItem(`sugar_telegram_task_completed_${userId}`, 'true');
            localStorage.setItem(`sugar_telegram_task_completed_at_${userId}`, new Date().toISOString());
            
            // Track successful task completion
            trackActivity('task_completion', {
                task_type: 'telegram_join',
                task_id: 'telegram_task',
                reward: CAMPAIGN_CONFIG.rewards.telegramJoin
            });
            
            // Update UI immediately
            updateTelegramTaskUI(true);
            
            // Recalculate pending rewards immediately
            calculatePendingRewards();
            
            // Update eligibility and reward messages
            updateRewardMessages();
            
            // Update dashboard in real-time if user is authenticated
            if (isUserAuthenticated()) {
                updateDashboardData();
            }
            
            // Show success message
            showTaskSuccess('telegram-task', `Task completed! +${CAMPAIGN_CONFIG.rewards.telegramJoin} $SUGAR will be distributed at campaign end.`);
            
            // Track task completion
            trackEvent('telegram_task_completed', { 
                user_id: userId,
                wallet_saved: true,
                pending_reward: CAMPAIGN_CONFIG.rewards.telegramJoin
            });
        }
    }, 2000);
}

// Update Telegram task UI
function updateTelegramTaskUI(completed) {
    const statusBadge = document.getElementById('telegram-status');
    const actionButton = document.getElementById('telegram-btn');
    
    if (completed) {
        statusBadge.className = 'status-badge status-completed';
        statusBadge.textContent = 'Completed';
        
        actionButton.disabled = true;
        actionButton.innerHTML = '<i class="fas fa-check"></i> Completed';
        actionButton.className = 'btn btn-secondary';
    }
}

// Check Telegram task status on load
function checkTelegramTaskStatus() {
    if (!isUserAuthenticated()) return;
    
    const currentUser = getCurrentUser();
    const userId = currentUser.id;
    
    const taskCompleted = localStorage.getItem(`sugar_telegram_task_completed_${userId}`);
    if (taskCompleted === 'true') {
        updateTelegramTaskUI(true);
        
        const completedAt = localStorage.getItem(`sugar_telegram_task_completed_at_${userId}`);
        if (completedAt) {
            const completedDate = new Date(completedAt);
            console.log('Telegram task completed on:', completedDate.toLocaleDateString());
        }
    }
}

// Show task success message
function showTaskSuccess(taskId, message) {
    const taskCard = document.getElementById(taskId);
    if (taskCard) {
        // Create success notification
        const successDiv = document.createElement('div');
        successDiv.className = 'task-success-notification';
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, rgba(78, 205, 196, 0.9), rgba(68, 160, 141, 0.9));
            color: white;
            padding: 20px 30px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(78, 205, 196, 0.3);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
            max-width: 400px;
        `;
        successDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px;">
                <i class="fas fa-check-circle" style="font-size: 1.5rem;"></i>
                <div>
                    <h4 style="margin: 0; font-weight: 600;">Task Completed!</h4>
                    <p style="margin: 5px 0 0; opacity: 0.9;">${message}</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(successDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            successDiv.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(successDiv);
            }, 300);
        }, 5000);
    }
}

// Add slide animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Engagement Tracking System
function loadEngagementData() {
    if (!isUserAuthenticated()) return;
    
    const currentUser = getCurrentUser();
    const userId = currentUser.id;
    
    // Load user's engagement data
    const engagementData = localStorage.getItem(`sugar_engagement_${userId}`);
    if (engagementData) {
        const data = JSON.parse(engagementData);
        updateEngagementUI(data);
    } else {
        // Initialize with default values
        const defaultData = {
            reactions: 0,
            engagements: 0,
            likes: 0,
            comments: 0,
            totalActions: 0,
            rewardsEarned: 0,
            lastActionDate: null,
            dailyActions: 0,
            lastDailyReset: new Date().toDateString()
        };
        localStorage.setItem(`sugar_engagement_${userId}`, JSON.stringify(defaultData));
        updateEngagementUI(defaultData);
    }
}

function updateEngagementUI(data) {
    // Update progress stats
    document.getElementById('total-likes').textContent = data.likes || 0;
    document.getElementById('total-comments').textContent = data.comments || 0;
    document.getElementById('total-reactions').textContent = data.reactions || 0;
    
    // Calculate total pending rewards from reactions and engagements
    const reactionRewards = (data.reactions || 0) * CAMPAIGN_CONFIG.rewards.reaction;
    const engagementRewards = (data.engagements || 0) * CAMPAIGN_CONFIG.rewards.engagement;
    const totalRewards = reactionRewards + engagementRewards;
    
    // Update task status
    const engageStatus = document.getElementById('engage-status');
    if (engageStatus) {
        engageStatus.textContent = `${data.dailyActions || 0}/10 actions`;
        
        // Check if daily goal is reached
        if (data.dailyActions >= 10) {
            engageStatus.className = 'status-badge status-completed';
        } else {
            engageStatus.className = 'status-badge status-pending';
        }
    }
    
    // Recalculate pending rewards
    calculatePendingRewards();
}

function trackEngagement() {
    if (!isUserAuthenticated()) {
        alert('Please login with Telegram first!');
        showTelegramLogin();
        return;
    }
    
    const currentUser = getCurrentUser();
    const userId = currentUser.id;
    
    // Show engagement tracking modal
    showEngagementModal();
}

function showEngagementModal() {
    // Create modal for tracking engagement
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Track Your Engagement</h3>
                <button class="modal-close" onclick="closeEngagementModal(this)">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="engagement-actions">
                    <h4>What did you do in our Telegram Group & Channel?</h4>
                    <div class="action-buttons">
                        <button class="btn btn-secondary" onclick="recordEngagement('react')">
                            <i class="fas fa-smile"></i>
                            Reacted to Post
                            <small>+1 $SUGAR</small>
                        </button>
                        <button class="btn btn-secondary" onclick="recordEngagement('like')">
                            <i class="fas fa-heart"></i>
                            Liked a Post
                            <small>+3 $SUGAR</small>
                        </button>
                        <button class="btn btn-secondary" onclick="recordEngagement('comment')">
                            <i class="fas fa-comment"></i>
                            Commented
                            <small>+3 $SUGAR</small>
                        </button>
                    </div>
                    <div class="engagement-info">
                        <p><strong>Rewards:</strong> 1 $SUGAR per reaction, 3 $SUGAR per engagement (like, comment)</p>
                        <p><strong>Distribution:</strong> All rewards distributed at campaign end</p>
                        <p><strong>Current Progress:</strong> <span id="modal-progress">0/10</span> actions today</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Update progress in modal
    updateModalProgress();
}

function updateModalProgress() {
    const currentUser = getCurrentUser();
    const userId = currentUser.id;
    const engagementData = JSON.parse(localStorage.getItem(`sugar_engagement_${userId}`) || '{}');
    const progressSpan = document.getElementById('modal-progress');
    if (progressSpan) {
        progressSpan.textContent = `${engagementData.dailyActions || 0}/10`;
    }
}

function closeEngagementModal(button) {
    const modal = button.closest('.modal');
    document.body.removeChild(modal);
}

function recordEngagement(actionType) {
    const currentUser = getCurrentUser();
    const userId = currentUser.id;
    
    // Load current engagement data
    const engagementKey = `sugar_engagement_${userId}`;
    let data = JSON.parse(localStorage.getItem(engagementKey) || '{}');
    
    // Check daily reset
    const today = new Date().toDateString();
    if (data.lastDailyReset !== today) {
        data.dailyActions = 0;
        data.lastDailyReset = today;
    }
    
    // Check daily limit
    if (data.dailyActions >= 10) {
        alert('Daily engagement limit reached! Come back tomorrow for more rewards.');
        return;
    }
    
    // Record the action
    data.totalActions = (data.totalActions || 0) + 1;
    data.dailyActions = (data.dailyActions || 0) + 1;
    data.lastActionDate = new Date().toISOString();
    
    let rewardAmount = 0;
    let actionMessage = '';
    
    // Update specific action counts and calculate rewards
    switch(actionType) {
        case 'react':
            data.reactions = (data.reactions || 0) + 1;
            rewardAmount = CAMPAIGN_CONFIG.rewards.reaction;
            actionMessage = 'Reacted to a post';
            break;
        case 'like':
            data.likes = (data.likes || 0) + 1;
            data.engagements = (data.engagements || 0) + 1;
            rewardAmount = CAMPAIGN_CONFIG.rewards.engagement;
            actionMessage = 'Liked a post';
            break;
        case 'comment':
            data.comments = (data.comments || 0) + 1;
            data.engagements = (data.engagements || 0) + 1;
            rewardAmount = CAMPAIGN_CONFIG.rewards.engagement;
            actionMessage = 'Commented';
            break;
    }
    
    // Update total rewards earned
    data.rewardsEarned = (data.rewardsEarned || 0) + rewardAmount;
    
    // Save updated data
    localStorage.setItem(engagementKey, JSON.stringify(data));
    
    // Update UI immediately
    updateEngagementUI(data);
    updateModalProgress();
    
    // Recalculate all pending rewards to ensure balance is updated
    calculatePendingRewards();
    
    // Update eligibility and reward messages
    updateRewardMessages();
    
    // Update dashboard in real-time if user is authenticated
    if (isUserAuthenticated()) {
        updateDashboardData();
    }
    
    // Show success message
    showTaskSuccess('engagement', `${actionMessage}! +${rewardAmount} $SUGAR will be distributed at campaign end.`);
    
    // Track engagement event
    trackEvent('engagement_recorded', {
        user_id: userId,
        action_type: actionType,
        daily_actions: data.dailyActions,
        pending_reward: rewardAmount,
        total_rewards_earned: data.rewardsEarned
    });
    
    // Check if daily goal is completed
    if (data.dailyActions >= 10) {
        setTimeout(() => {
            showTaskSuccess('daily-goal', 'Daily engagement goal completed! Additional rewards will be distributed at campaign end.');
            trackEvent('daily_engagement_goal', {
                user_id: userId,
                total_actions: data.dailyActions
            });
        }, 1000);
    }
}

function getEngagementStats() {
    if (!isUserAuthenticated()) return null;
    
    const currentUser = getCurrentUser();
    const userId = currentUser.id;
    const engagementData = localStorage.getItem(`sugar_engagement_${userId}`);
    return engagementData ? JSON.parse(engagementData) : null;
}
// Dashboard Functions
function showDashboard() {
    // Check if user is authenticated first
    if (!isUserAuthenticated()) {
        showLoginRequiredNotification('Please login with Telegram first to access your dashboard!');
        showTelegramLogin();
        return;
    }
    
    // Check if user has completed signup (saved wallet)
    const savedWallet = localStorage.getItem('sugar_wallet_address');
    if (!savedWallet) {
        showLoginRequiredNotification('Please save your wallet address first to access your dashboard!');
        scrollToWallet();
        return;
    }
    
    // Track dashboard access
    trackActivity('dashboard_access', {
        access_method: 'navigation_menu'
    });
    
    // Hide all other sections
    document.querySelectorAll('main > section').forEach(section => {
        if (section.id !== 'dashboard') {
            section.style.display = 'none';
        }
    });
    
    // Show dashboard section
    const dashboardSection = document.getElementById('dashboard');
    if (dashboardSection) {
        dashboardSection.style.display = 'block';
        
        // Scroll to dashboard
        dashboardSection.scrollIntoView({ behavior: 'smooth' });
        
        // Start real-time monitoring
        startRealTimeMonitoring();
        
        // Update dashboard data
        updateDashboardData();
    }
}

function hideDashboard() {
    const dashboardSection = document.getElementById('dashboard');
    if (dashboardSection) {
        dashboardSection.style.display = 'none';
    }
}

// ...
function updateDashboardData() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const userId = currentUser.id;
    
    // Update user profile info
    updateDashboardProfile(currentUser);
    
    // Update rewards overview
    updateDashboardRewards(userId);
    
    // Update task progress
    updateDashboardTasks(userId);
    
    // Update engagement stats
    updateDashboardEngagement(userId);
    
    // Update referral stats
    updateDashboardReferrals(userId);
    
    // Update last updated time
    updateDashboardTimestamp();
}

function updateDashboardProfile(user) {
    const username = document.getElementById('dashboard-username');
    const wallet = document.getElementById('dashboard-wallet');
    const memberSince = document.getElementById('dashboard-member-since');
    const avatar = document.getElementById('dashboard-avatar');
    
    if (username) {
        username.textContent = user.first_name || user.username || 'Telegram User';
    }
    
    if (wallet) {
        const savedWallet = localStorage.getItem('sugar_wallet_address');
        wallet.textContent = savedWallet || 'No wallet connected';
    }
    
    if (memberSince) {
        const authDate = localStorage.getItem('sugar_telegram_auth_at');
        if (authDate) {
            const date = new Date(authDate);
            memberSince.textContent = `Member since: ${date.toLocaleDateString()}`;
        }
    }
    
    if (avatar) {
        const displayName = user.first_name || user.username || 'User';
        if (user.photo_url) {
            avatar.innerHTML = `<img src="${user.photo_url}" alt="${displayName}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
        } else {
            avatar.innerHTML = displayName.charAt(0).toUpperCase();
        }
    }
}

function updateDashboardRewards(userId) {
    const totalEarned = document.getElementById('dashboard-total-earned');
    const pending = document.getElementById('dashboard-pending');
    const eligibility = document.getElementById('dashboard-eligibility');
    const progressFill = document.getElementById('dashboard-progress-fill');
    const progressText = document.getElementById('dashboard-progress-text');
    
    // Calculate total rewards
    let totalRewards = 0;
    
    // Telegram task reward
    const telegramCompleted = localStorage.getItem(`sugar_telegram_task_completed_${userId}`) === 'true';
    if (telegramCompleted) {
        totalRewards += CAMPAIGN_CONFIG.rewards.telegramJoin;
    }
    
    // Subscription rewards
    const groupSubscribed = localStorage.getItem(`sugar_group_subscribed_${userId}`) === 'true';
    const channelSubscribed = localStorage.getItem(`sugar_channel_subscribed_${userId}`) === 'true';
    
    if (groupSubscribed) {
        totalRewards += CAMPAIGN_CONFIG.rewards.groupSubscription;
    }
    
    if (channelSubscribed) {
        totalRewards += CAMPAIGN_CONFIG.rewards.channelSubscription;
    }
    
    // Engagement rewards
    const engagementData = localStorage.getItem(`sugar_engagement_${userId}`);
    if (engagementData) {
        const data = JSON.parse(engagementData);
        const reactionRewards = (data.reactions || 0) * CAMPAIGN_CONFIG.rewards.reaction;
        const engagementRewards = (data.engagements || 0) * CAMPAIGN_CONFIG.rewards.engagement;
        totalRewards += reactionRewards + engagementRewards;
    }
    
    // Referral rewards
    const referralData = getUserReferralData(userId);
    if (referralData) {
        const completedReferrals = referralData.referrals.filter(r => r.status === 'completed');
        totalRewards += completedReferrals.length * CAMPAIGN_CONFIG.rewards.referral;
    }
    
    // Update UI
    if (totalEarned) {
        totalEarned.textContent = totalRewards.toLocaleString();
    }
    
    if (pending) {
        pending.textContent = totalRewards.toLocaleString();
    }
    
    if (eligibility) {
        if (totalRewards >= CAMPAIGN_CONFIG.eligibility.minAmount) {
            eligibility.textContent = 'Eligible';
            eligibility.style.color = 'var(--secondary-color)';
        } else {
            eligibility.textContent = 'Not Eligible';
            eligibility.style.color = 'var(--text-secondary)';
        }
    }
    
    // Update progress bar
    const progress = Math.min((totalRewards / CAMPAIGN_CONFIG.eligibility.minAmount) * 100, 100);
    if (progressFill) {
        progressFill.style.width = `${progress}%`;
    }
    
    if (progressText) {
        progressText.textContent = totalRewards.toLocaleString();
    }
}

function updateDashboardTasks(userId) {
    const telegramStatus = document.getElementById('dashboard-telegram-status');
    const groupStatus = document.getElementById('dashboard-group-status');
    const channelStatus = document.getElementById('dashboard-channel-status');
    
    // Telegram task
    const telegramCompleted = localStorage.getItem(`sugar_telegram_task_completed_${userId}`) === 'true';
    if (telegramStatus) {
        telegramStatus.textContent = telegramCompleted ? 'Completed' : 'Pending';
        telegramStatus.className = `task-status ${telegramCompleted ? 'completed' : 'pending'}`;
    }
    
    // Group subscription
    const groupSubscribed = localStorage.getItem(`sugar_group_subscribed_${userId}`) === 'true';
    if (groupStatus) {
        groupStatus.textContent = groupSubscribed ? 'Completed' : 'Pending';
        groupStatus.className = `task-status ${groupSubscribed ? 'completed' : 'pending'}`;
    }
    
    // Channel subscription
    const channelSubscribed = localStorage.getItem(`sugar_channel_subscribed_${userId}`) === 'true';
    if (channelStatus) {
        channelStatus.textContent = channelSubscribed ? 'Completed' : 'Pending';
        channelStatus.className = `task-status ${channelSubscribed ? 'completed' : 'pending'}`;
    }
}

function updateDashboardEngagement(userId) {
    const reactions = document.getElementById('dashboard-reactions');
    const likes = document.getElementById('dashboard-likes');
    const comments = document.getElementById('dashboard-comments');
    
    const engagementData = localStorage.getItem(`sugar_engagement_${userId}`);
    if (engagementData) {
        const data = JSON.parse(engagementData);
        
        if (reactions) {
            reactions.textContent = (data.reactions || 0).toLocaleString();
        }
        
        if (likes) {
            likes.textContent = (data.likes || 0).toLocaleString();
        }
        
        if (comments) {
            comments.textContent = (data.comments || 0).toLocaleString();
        }
    }
}

function updateDashboardReferrals(userId) {
    const referralCode = document.getElementById('dashboard-referral-code');
    const totalReferrals = document.getElementById('dashboard-total-referrals');
    const completedReferrals = document.getElementById('dashboard-completed-referrals');
    const referralEarnings = document.getElementById('dashboard-referral-earnings');
    
    const referralData = getUserReferralData(userId);
    if (referralData) {
        if (referralCode) {
            referralCode.textContent = referralData.referralCode || 'YOUR_CODE';
        }
        
        const total = referralData.referrals.length;
        const completed = referralData.referrals.filter(r => r.status === 'completed').length;
        const earnings = completed * CAMPAIGN_CONFIG.rewards.referral;
        
        if (totalReferrals) {
            totalReferrals.textContent = total.toLocaleString();
        }
        
        if (completedReferrals) {
            completedReferrals.textContent = completed.toLocaleString();
        }
        
        if (referralEarnings) {
            referralEarnings.textContent = `${earnings.toLocaleString()} $SUGAR`;
        }
    }
}

function updateDashboardTimestamp() {
    const lastUpdated = document.getElementById('dashboard-last-updated');
    if (lastUpdated) {
        lastUpdated.textContent = 'Just now';
    }
}

function refreshDashboard() {
    updateDashboardData();
    
    // Show refresh animation
    const refreshBtn = event.target;
    if (refreshBtn) {
        refreshBtn.innerHTML = '<i class="fas fa-sync fa-spin"></i> Refreshing...';
        refreshBtn.disabled = true;
        
        setTimeout(() => {
            refreshBtn.innerHTML = '<i class="fas fa-sync"></i> Refresh';
            refreshBtn.disabled = false;
            updateDashboardTimestamp();
        }, 1000);
    }
}

function generateDashboardLink(userId) {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?dashboard=${userId}`;
}

function showPersonalDashboard(userId) {
    // Hide other sections
    hideDashboard();
    const joinSection = document.getElementById('join');
    if (joinSection) {
        joinSection.style.display = 'none';
    }
    
    // Show dashboard
    const dashboardSection = document.getElementById('dashboard');
    if (dashboardSection) {
        dashboardSection.style.display = 'block';
        updateDashboardData();
    }
    
    // Scroll to dashboard
    dashboardSection.scrollIntoView({ behavior: 'smooth' });
}

// Check for dashboard parameter in URL
function checkDashboardParameter() {
    const urlParams = new URLSearchParams(window.location.search);
    const dashboardUserId = urlParams.get('dashboard');
    
    if (dashboardUserId) {
        // Check if user is authenticated
        if (isUserAuthenticated()) {
            const currentUser = getCurrentUser();
            if (currentUser && currentUser.id === dashboardUserId) {
                showPersonalDashboard(dashboardUserId);
            }
        } else {
            // Redirect to login first
            showTelegramLogin();
        }
    }
}

// Real-time monitoring system
let realTimeInterval = null;
let isMonitoring = false;

function startRealTimeMonitoring() {
    if (isMonitoring) return;
    
    isMonitoring = true;
    
    // Update immediately
    updateDashboardData();
    
    // Set up real-time updates every 5 seconds
    realTimeInterval = setInterval(() => {
        updateDashboardData();
        updateLastUpdatedTime();
    }, 5000);
    
    console.log('📊 Real-time dashboard monitoring started');
}

function stopRealTimeMonitoring() {
    if (realTimeInterval) {
        clearInterval(realTimeInterval);
        realTimeInterval = null;
        isMonitoring = false;
        console.log('⏹️ Real-time dashboard monitoring stopped');
    }
}

function updateLastUpdatedTime() {
    const lastUpdated = document.getElementById('dashboard-last-updated');
    if (lastUpdated) {
        const now = new Date();
        lastUpdated.textContent = now.toLocaleTimeString();
    }
}

// Enhanced dashboard data update with real-time changes
function updateDashboardData() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const userId = currentUser.id;
    
    // Store previous values for change detection
    const previousData = {
        totalRewards: document.getElementById('dashboard-total-earned')?.textContent || '0',
        pending: document.getElementById('dashboard-pending')?.textContent || '0',
        eligibility: document.getElementById('dashboard-eligibility')?.textContent || 'Not Eligible'
    };
    
    // Update all dashboard sections
    updateDashboardProfile(currentUser);
    updateDashboardRewards(userId);
    updateDashboardTasks(userId);
    updateDashboardEngagement(userId);
    updateDashboardReferrals(userId);
    updateDashboardTimestamp();
    
    // Check for changes and show notifications
    const currentData = {
        totalRewards: document.getElementById('dashboard-total-earned')?.textContent || '0',
        pending: document.getElementById('dashboard-pending')?.textContent || '0',
        eligibility: document.getElementById('dashboard-eligibility')?.textContent || 'Not Eligible'
    };
    
    // Show change notifications
    if (previousData.totalRewards !== currentData.totalRewards) {
        showRewardChangeNotification(previousData.totalRewards, currentData.totalRewards);
    }
    
    if (previousData.eligibility !== currentData.eligibility && currentData.eligibility === 'Eligible') {
        showEligibilityAchievedNotification();
    }
}

function showRewardChangeNotification(oldAmount, newAmount) {
    const oldValue = parseInt(oldAmount.replace(/,/g, ''));
    const newValue = parseInt(newAmount.replace(/,/g, ''));
    const difference = newValue - oldValue;
    
    if (difference > 0) {
        // Create a subtle notification for reward increase
        const notification = document.createElement('div');
        notification.className = 'reward-change-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-coins"></i>
                <span>+${difference.toLocaleString()} $SUGAR earned!</span>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, rgba(78, 205, 196, 0.9), rgba(68, 160, 141, 0.9));
            color: white;
            padding: 12px 20px;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(78, 205, 196, 0.3);
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
}

function showEligibilityAchievedNotification() {
    const notification = document.createElement('div');
    notification.className = 'eligibility-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-trophy"></i>
            <div>
                <strong>🎉 Congratulations!</strong><br>
                You're now eligible for the airdrop!
            </div>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, rgba(255, 215, 0, 0.95), rgba(255, 193, 7, 0.95));
        color: white;
        padding: 30px 40px;
        border-radius: 15px;
        box-shadow: 0 10px 40px rgba(255, 215, 0, 0.4);
        z-index: 10001;
        animation: fadeInScale 0.5s ease-out;
        text-align: center;
        max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Hero Wallet Section Function
function saveHeroWalletAddress() {
    // Check if user is authenticated first
    if (!isUserAuthenticated()) {
        showLoginRequiredNotification('Please login with Telegram first before saving your wallet address!');
        showTelegramLogin();
        return;
    }
    
    const walletInput = document.getElementById('hero-wallet-address');
    const walletStatus = document.getElementById('hero-wallet-status');
    const walletAddress = walletInput.value.trim();
    
    if (!walletAddress) {
        showHeroWalletStatus('Please enter a wallet address', 'error');
        return;
    }
    
    if (!isValidSolanaAddress(walletAddress)) {
        showHeroWalletStatus('Invalid Solana wallet address format', 'error');
        return;
    }
    
    // Check if wallet is already saved
    const existingWallet = localStorage.getItem('sugar_wallet_address');
    if (existingWallet && existingWallet === walletAddress) {
        showHeroWalletStatus('This wallet address is already saved!', 'success');
        return;
    }
    
    // Track wallet save attempt
    trackActivity('wallet_save_attempt', {
        wallet_address: walletAddress.substring(0, 8) + '...'
    });
    
    // Save wallet address
    localStorage.setItem('sugar_wallet_address', walletAddress);
    localStorage.setItem('sugar_wallet_saved_at', new Date().toISOString());
    
    // Track successful wallet save
    trackActivity('wallet_save', {
        wallet_address: walletAddress.substring(0, 8) + '...',
        location: 'hero_section'
    });
    
    // Update hero UI
    walletInput.disabled = true;
    walletInput.value = walletAddress;
    
    const saveBtn = walletInput.nextElementSibling;
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-check"></i> Saved';
    
    showHeroWalletStatus('Wallet address saved successfully! You can now access your dashboard and start earning.', 'success');
    
    // Update join section visibility after wallet save
    updateJoinSectionVisibility();
    
    // Update the original wallet form if it exists
    const originalWalletInput = document.getElementById('wallet-address');
    if (originalWalletInput) {
        originalWalletInput.value = walletAddress;
        originalWalletInput.disabled = true;
        const originalSaveBtn = originalWalletInput.nextElementSibling;
        if (originalSaveBtn) {
            originalSaveBtn.disabled = true;
            originalSaveBtn.innerHTML = '<i class="fas fa-check"></i> Saved';
        }
    }
    
    // Show success notification
    showTaskSuccess('hero-wallet-saved', 'Wallet address saved! You can now access your dashboard and start earning.');
    
    // Show dashboard access notification
    showDashboardAccessNotification();
    
    // Track wallet save event
    trackEvent('hero_wallet_saved', {
        wallet_address: walletAddress.substring(0, 8) + '...',
        timestamp: new Date().toISOString(),
        location: 'hero_section'
    });
}

function showHeroWalletStatus(message, type) {
    const statusElement = document.getElementById('hero-wallet-status');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = `wallet-status-message ${type}`;
        
        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                statusElement.className = 'wallet-status-message';
            }, 5000);
        }
    }
}

// Login Required Notification System
function showLoginRequiredNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'login-required-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fab fa-telegram"></i>
            <div>
                <strong>🔐 Login Required</strong><br>
                ${message}
            </div>
            <button class="btn btn-small" onclick="showTelegramLogin()">
                <i class="fab fa-telegram"></i>
                Login Now
            </button>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, rgba(255, 107, 107, 0.95), rgba(255, 87, 87, 0.95));
        color: white;
        padding: 20px;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(255, 107, 107, 0.4);
        z-index: 10001;
        animation: slideInRight 0.5s ease-out;
        max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 8 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 8000);
}

function showDashboardAccessNotification() {
    const notification = document.createElement('div');
    notification.className = 'dashboard-access-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-chart-line"></i>
            <div>
                <strong>📊 Dashboard Unlocked!</strong><br>
                You can now monitor your rewards in real-time.
            </div>
            <button class="btn btn-small" onclick="showDashboard()">View Dashboard</button>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, rgba(78, 205, 196, 0.95), rgba(68, 160, 141, 0.95));
        color: white;
        padding: 20px;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(78, 205, 196, 0.3);
        z-index: 10000;
        animation: slideInUp 0.5s ease-out;
        max-width: 350px;
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 8 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 8000);
}

// Welcome Back Notification for Returning Users
function showWelcomeBackNotification(user) {
    const savedWallet = localStorage.getItem('sugar_wallet_address');
    const walletStatus = savedWallet ? 'connected' : 'not connected';
    const totalRewards = calculateUserTotalRewards(user.id);
    
    const notification = document.createElement('div');
    notification.className = 'welcome-back-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <div class="welcome-avatar">
                <img src="${user.photoUrl}" alt="${user.username}" />
            </div>
            <div class="welcome-info">
                <strong>👋 Welcome back, ${user.firstName}!</strong><br>
                <span class="welcome-details">
                    Account: @${user.username}<br>
                    Wallet: ${walletStatus}<br>
                    Total Rewards: ${totalRewards.toLocaleString()} $SUGAR
                </span>
            </div>
            <div class="welcome-actions">
                ${!savedWallet ? `<button class="btn btn-small" onclick="scrollToWallet()">Connect Wallet</button>` : ''}
                <button class="btn btn-small btn-primary" onclick="showDashboard()">View Dashboard</button>
            </div>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, rgba(74, 144, 226, 0.95), rgba(59, 120, 216, 0.95));
        color: white;
        padding: 20px;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(74, 144, 226, 0.4);
        z-index: 10002;
        animation: slideInRight 0.5s ease-out;
        max-width: 400px;
        display: flex;
        align-items: center;
        gap: 15px;
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 10000);
}

// Welcome New User Notification
function showWelcomeNewUserNotification(user) {
    const notification = document.createElement('div');
    notification.className = 'welcome-new-user-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <div class="welcome-avatar">
                <img src="${user.photoUrl}" alt="${user.username}" />
            </div>
            <div class="welcome-info">
                <strong>🎉 Welcome to $SUGAR, ${user.firstName}!</strong><br>
                <span class="welcome-details">
                    Account: @${user.username}<br>
                    Start earning rewards by completing tasks!
                </span>
            </div>
            <div class="welcome-actions">
                <button class="btn btn-small" onclick="scrollToWallet()">Connect Wallet</button>
                <button class="btn btn-small btn-primary" onclick="showHowItWorks()">How It Works</button>
            </div>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, rgba(46, 213, 115, 0.95), rgba(39, 174, 96, 0.95));
        color: white;
        padding: 20px;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(46, 213, 115, 0.4);
        z-index: 10002;
        animation: slideInRight 0.5s ease-out;
        max-width: 400px;
        display: flex;
        align-items: center;
        gap: 15px;
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 10000);
}

// Calculate user's total rewards
function calculateUserTotalRewards(userId) {
    let totalRewards = 0;
    
    // Check Telegram task completion
    const telegramTaskCompleted = localStorage.getItem(`sugar_telegram_task_completed_${userId}`);
    if (telegramTaskCompleted === 'true') {
        totalRewards += CAMPAIGN_CONFIG.rewards.telegramJoin;
    }
    
    // Check group subscription
    const groupSubscribed = localStorage.getItem(`sugar_group_subscribed_${userId}`);
    if (groupSubscribed === 'true') {
        totalRewards += CAMPAIGN_CONFIG.rewards.groupSubscription;
    }
    
    // Check channel subscription
    const channelSubscribed = localStorage.getItem(`sugar_channel_subscribed_${userId}`);
    if (channelSubscribed === 'true') {
        totalRewards += CAMPAIGN_CONFIG.rewards.channelSubscription;
    }
    
    // Check engagement rewards
    const engagementData = localStorage.getItem(`sugar_engagement_${userId}`);
    if (engagementData) {
        const engagement = JSON.parse(engagementData);
        totalRewards += engagement.rewardsEarned || 0;
    }
    
    // Check referral rewards
    const referralData = localStorage.getItem(`sugar_referrals_${userId}`);
    if (referralData) {
        const referrals = JSON.parse(referralData);
        const completedReferrals = referrals.filter(r => r.status === 'completed');
        totalRewards += completedReferrals.length * CAMPAIGN_CONFIG.rewards.referral;
    }
    
    return totalRewards;
}

// Update the existing saveWalletAddress function to sync with hero section
function saveWalletAddress() {
    // Check if user is authenticated first
    if (!isUserAuthenticated()) {
        showLoginRequiredNotification('Please login with Telegram first before saving your wallet address!');
        showTelegramLogin();
        return;
    }
    
    const walletInput = document.getElementById('wallet-address');
    const walletAddress = walletInput.value.trim();
    
    if (!walletAddress) {
        showWalletStatus('Please enter a wallet address', 'error');
        return;
    }
    
    if (!isValidSolanaAddress(walletAddress)) {
        showWalletStatus('Invalid Solana wallet address format', 'error');
        return;
    }
    
    // Save wallet address
    localStorage.setItem('sugar_wallet_address', walletAddress);
    localStorage.setItem('sugar_wallet_saved_at', new Date().toISOString());
    
    // Update UI
    walletInput.disabled = true;
    walletInput.value = walletAddress;
    
    const saveBtn = walletInput.nextElementSibling;
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-check"></i> Saved';
    
    showWalletStatus('Wallet address saved successfully!', 'success');
    
    // Sync with hero section
    const heroWalletInput = document.getElementById('hero-wallet-address');
    if (heroWalletInput) {
        heroWalletInput.value = walletAddress;
        heroWalletInput.disabled = true;
        const heroSaveBtn = heroWalletInput.nextElementSibling;
        if (heroSaveBtn) {
            heroSaveBtn.disabled = true;
            heroSaveBtn.innerHTML = '<i class="fas fa-check"></i> Saved';
        }
        showHeroWalletStatus('Wallet address saved successfully!', 'success');
    }
    
    // Show success notification
    showTaskSuccess('wallet-saved', 'Wallet address saved! You can now access your dashboard.');
    
    // Show dashboard access notification
    showDashboardAccessNotification();
    
    // Update dashboard if user is authenticated
    if (isUserAuthenticated()) {
        updateDashboardData();
    }
    
    // Track wallet save event
    trackEvent('wallet_saved', {
        wallet_address: walletAddress.substring(0, 8) + '...',
        timestamp: new Date().toISOString()
    });
}

// Update task completion functions to trigger real-time updates
function completeTelegramTask() {
    // ... existing code ...
    
    // After successful completion, update dashboard in real-time
    if (isUserAuthenticated()) {
        updateDashboardData();
    }
}

function subscribeToGroup() {
    // ... existing code ...
    
    // After successful subscription, update dashboard in real-time
    if (isUserAuthenticated()) {
        updateDashboardData();
    }
}

function subscribeToChannel() {
    // ... existing code ...
    
    // After successful subscription, update dashboard in real-time
    if (isUserAuthenticated()) {
        updateDashboardData();
    }
}

function recordEngagement(actionType) {
    // ... existing code ...
    
    // After recording engagement, update dashboard in real-time
    if (isUserAuthenticated()) {
        updateDashboardData();
    }
}

// Stop monitoring when dashboard is hidden
function hideDashboard() {
    stopRealTimeMonitoring();
    
    const dashboardSection = document.getElementById('dashboard');
    if (dashboardSection) {
        dashboardSection.style.display = 'none';
    }
}

// Export functions for global access
window.saveWalletAddress = saveWalletAddress;
window.saveHeroWalletAddress = saveHeroWalletAddress;
window.copyReferralLink = copyReferralLink;
window.scrollToJoin = scrollToJoin;
window.scrollToWallet = scrollToWallet;
window.showHowItWorks = showHowItWorks;
window.completeTelegramTask = completeTelegramTask;
window.showTelegramLogin = showTelegramLogin;
window.closeTelegramLogin = closeTelegramLogin;
window.showTelegramOnlyLoginInstruction = showTelegramOnlyLoginInstruction;
window.openTelegramForLogin = openTelegramForLogin;
window.showLoginLoadingNotification = showLoginLoadingNotification;
window.redirectToTelegramLogin = redirectToTelegramLogin;
window.redirectToTelegramLoginImmediate = redirectToTelegramLoginImmediate;
window.confirmTelegramLogin = confirmTelegramLogin;
window.reopenTelegram = reopenTelegram;
window.closeTelegramLoginInstruction = closeTelegramLoginInstruction;
window.openTelegramLink = openTelegramLink;
window.showTelegramAppPrompt = showTelegramAppPrompt;
window.closeTelegramPrompt = closeTelegramPrompt;
window.openInTelegramApp = openInTelegramApp;
window.openInBrowser = openInBrowser;
window.simulateTelegramLogin = simulateTelegramLogin;
window.logout = logout;
window.trackEngagement = trackEngagement;
window.recordEngagement = recordEngagement;
window.closeEngagementModal = closeEngagementModal;
window.subscribeToGroup = subscribeToGroup;
window.subscribeToChannel = subscribeToChannel;
window.closeSubscriptionModal = closeSubscriptionModal;
window.closeReferralNotification = closeReferralNotification;
window.clearWalletData = clearWalletData; // For testing only
window.showDashboard = showDashboard;
window.hideDashboard = hideDashboard;
window.refreshDashboard = refreshDashboard;
window.generateDashboardLink = generateDashboardLink;
window.showPersonalDashboard = showPersonalDashboard;
window.startRealTimeMonitoring = startRealTimeMonitoring;
window.stopRealTimeMonitoring = stopRealTimeMonitoring;

// Export activity tracking functions
window.trackActivity = trackActivity;
window.updateActivityCounters = updateActivityCounters;
window.startSessionTracking = startSessionTracking;
window.getActivityStats = getActivityStats;
window.getUserActivities = getUserActivities;
window.showWelcomeBackNotification = showWelcomeBackNotification;
window.showWelcomeNewUserNotification = showWelcomeNewUserNotification;
window.calculateUserTotalRewards = calculateUserTotalRewards;

// Export production functions
window.openRealTelegramBot = openRealTelegramBot;
window.testBotConnection = testBotConnection;
window.showBotSetupInstructions = showBotSetupInstructions;
window.closeModal = closeModal;
window.showWalletStatus = showWalletStatus;
window.updateJoinSectionVisibility = updateJoinSectionVisibility;
window.forceHideJoinSection = forceHideJoinSection;
window.handleRealTelegramLogin = handleRealTelegramLogin;
window.simulateTelegramLogin = simulateTelegramLogin; // Production ready
