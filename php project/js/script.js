document.addEventListener('DOMContentLoaded', () => {

    // --- Splash Screen Logic ---
    const splashScreen = document.getElementById('splash-screen');
    const viewEntranceBtn = document.getElementById('view-entrance-btn');

    function showSplash() {
        if (splashScreen) {
            splashScreen.style.display = 'flex';
            setTimeout(() => splashScreen.classList.remove('hide'), 10);
            splashScreen.style.cursor = 'pointer';
        }
    }

    function hideSplash() {
        if (splashScreen) {
            splashScreen.classList.add('hide');
            setTimeout(() => {
                splashScreen.style.display = 'none';
            }, 800);
        }
    }

    if (splashScreen) {
        splashScreen.addEventListener('click', (e) => {
            // Do nothing on click anymore, must login or use enter logic if we keep it.
            // But the requirement says "if the user login only give the access".
            // So we disable the click-to-enter behavior.

            // OPTIONAL: Add a subtle feedback or open login if they click anywhere?
            // splashLoginBtn.click(); 
        });

        // Remove the pointer cursor and title
        splashScreen.style.cursor = 'default';
        splashScreen.removeAttribute('title');
    }

    // Access back to splash screen via button
    if (viewEntranceBtn) {
        viewEntranceBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.hash = ''; // Clear hash to show entrance
        });
    }



    // Splash Login Logic
    const splashLoginBtn = document.getElementById('splash-login-btn');
    const splashLoginOverlay = document.getElementById('splash-login-overlay');
    const closeSplashLogin = document.getElementById('close-splash-login');
    const splashLoginForm = document.getElementById('splash-login-form');
    const toggleLoginMode = document.getElementById('toggle-login-mode');
    const loginTitle = document.getElementById('login-title');
    const toggleText = document.getElementById('toggle-text');
    const submitBtnText = document.getElementById('submit-btn-text');

    let isSignUpMode = false;
    let previewTimer = null;
    let isGuestMode = sessionStorage.getItem('isGuestMode') === 'true';
    let isAdminLogin = false;
    let isProfileFilled = localStorage.getItem('isProfileFilled') === 'true';
    const splashAdminBtn = document.getElementById('splash-admin-btn');
    const guestPreviewBtn = document.getElementById('guest-preview-btn');

    function forceLoginAfterPreview() {
        isGuestMode = false;
        sessionStorage.removeItem('isGuestMode');
        sessionStorage.removeItem('guestExpires');
        alert('Your 2-minute guest preview has expired. Please Register or Login to continue.');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('isProfileFilled');
        window.location.hash = '';
        showSplash();
        if (splashLoginOverlay) {
            splashLoginOverlay.classList.add('active');
            if (closeSplashLogin) closeSplashLogin.style.display = 'none';
        }
    }

    if (isGuestMode) {
        const expires = parseInt(sessionStorage.getItem('guestExpires'));
        const remaining = expires - Date.now();
        if (remaining > 0) {
            previewTimer = setTimeout(forceLoginAfterPreview, remaining);
        } else {
            forceLoginAfterPreview();
        }
    }

    if (guestPreviewBtn) {
        // Check if already used in this session
        if (sessionStorage.getItem('guestPreviewUsed') === 'true') {
            guestPreviewBtn.style.display = 'none';
        }

        guestPreviewBtn.addEventListener('click', (e) => {
            e.stopPropagation();

            if (sessionStorage.getItem('guestPreviewUsed') === 'true') {
                alert('You have already used the Guest Preview in this session.');
                guestPreviewBtn.style.display = 'none';
                return;
            }

            isGuestMode = true;
            sessionStorage.setItem('isGuestMode', 'true');
            sessionStorage.setItem('guestPreviewUsed', 'true'); // Mark as used for this session
            sessionStorage.setItem('guestExpires', Date.now() + 120000);

            hideSplash();
            window.location.hash = '#dashboard';
            handleNavigation();

            if (previewTimer) clearTimeout(previewTimer);
            previewTimer = setTimeout(forceLoginAfterPreview, 120000);
        });
    }

    // Profile Completion Elements
    const profileCompletionOverlay = document.getElementById('profile-completion-overlay');
    const profileCompletionForm = document.getElementById('profile-completion-form');

    if (splashLoginBtn && splashLoginOverlay) {
        splashLoginBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Don't enter dashboard
            splashLoginOverlay.classList.add('active');
        });

        if (splashAdminBtn) {
            splashAdminBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                window.location.href = 'admin.html';
            });
        }

        closeSplashLogin.addEventListener('click', (e) => {
            e.stopPropagation();
            splashLoginOverlay.classList.remove('active');

            // Reset Admin State
            setTimeout(() => {
                isAdminLogin = false;
                loginTitle.textContent = 'Account Login';
                document.querySelector('.login-footer').style.display = 'block';
            }, 300);
        });

        if (toggleLoginMode) {
            toggleLoginMode.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                isSignUpMode = !isSignUpMode;

                const nameField = splashLoginOverlay.querySelector('.name-field');
                const contactField = splashLoginOverlay.querySelector('.contact-field');
                const emailField = splashLoginOverlay.querySelector('.email-field');

                if (isSignUpMode) {
                    loginTitle.textContent = 'Create Account';
                    toggleText.textContent = 'Already have an account?';
                    toggleLoginMode.textContent = 'Login';
                    submitBtnText.textContent = 'Create Account';
                    nameField.style.display = 'flex';
                    contactField.style.display = 'flex';
                    emailField.style.display = 'flex';
                    document.getElementById('password-requirements').style.display = 'block';
                    nameField.querySelector('input').required = true;
                    contactField.querySelector('input').required = true;
                    emailField.querySelector('input').required = true;
                } else {
                    loginTitle.textContent = 'Account Login';
                    toggleText.textContent = "Don't have an account?";
                    toggleLoginMode.textContent = 'Register';
                    submitBtnText.textContent = 'Login';
                    contactField.style.display = 'none';
                    emailField.style.display = 'none';
                    contactField.querySelector('input').required = false;
                    emailField.querySelector('input').required = false;
                    document.getElementById('password-requirements').style.display = 'none';
                }
            });
        }



        // Close on overlay click
        splashLoginOverlay.addEventListener('click', (e) => {
            if (e.target === splashLoginOverlay) {
                splashLoginOverlay.classList.remove('active');
                // Reset to login view if closing
                document.getElementById('login-form-container').style.display = 'block';
                document.getElementById('forgot-password-container').style.display = 'none';
            }
        });

        // --- Forgot Password Logic ---
        const forgotPwLink = document.getElementById('forgot-pw-link');
        const backToLogin = document.getElementById('back-to-login');
        const loginContainer = document.getElementById('login-form-container');
        const forgotContainer = document.getElementById('forgot-password-container');
        const forgotForm = document.getElementById('forgot-pw-form');
        const resetNewPwFields = document.getElementById('reset-new-pw-fields');
        const resetPwBtn = document.getElementById('reset-pw-btn');

        if (forgotPwLink) {
            forgotPwLink.addEventListener('click', (e) => {
                e.preventDefault();
                loginContainer.style.display = 'none';
                forgotContainer.style.display = 'block';
                resetNewPwFields.style.display = 'none';
                resetPwBtn.textContent = 'Verify Email';
                forgotForm.reset();
            });
        }

        if (backToLogin) {
            backToLogin.addEventListener('click', (e) => {
                e.preventDefault();
                forgotContainer.style.display = 'none';
                loginContainer.style.display = 'block';
            });
        }

        if (forgotForm) {
            forgotForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('reset-email').value;
                let registeredUsers = JSON.parse(localStorage.getItem('shree_users')) || [];
                const userIndex = registeredUsers.findIndex(u => u.email === email);

                if (resetPwBtn.textContent === 'Verify Email') {
                    if (userIndex === -1) {
                        alert('No account found with this email address.');
                    } else {
                        resetNewPwFields.style.display = 'block';
                        resetPwBtn.textContent = 'Reset Password';
                        document.getElementById('reset-email').readOnly = true;
                    }
                } else {
                    const newPw = document.getElementById('reset-new-password').value;
                    // Updated regex: At least 8 chars, 1 upper, 1 lower, 1 number, 1 special char (any non-word char)
                    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

                    if (!passwordRegex.test(newPw)) {
                        alert('New password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.');
                        return;
                    }

                    registeredUsers[userIndex].password = newPw;
                    localStorage.setItem('shree_users', JSON.stringify(registeredUsers));

                    alert('Password reset successful! You can now login with your new password.');
                    backToLogin.click();
                }
            });
        }

        // Prevent dashboard entry when clicking inside login box
        splashLoginOverlay.querySelector('.splash-login-box').addEventListener('click', (e) => {
            e.stopPropagation();
        });

        if (splashLoginForm) {
            splashLoginForm.addEventListener('submit', (e) => {
                e.preventDefault();

                const nameInput = document.getElementById('user-fullname');
                const nameValue = nameInput.value.trim();

                const passwordInput = document.getElementById('user-password');
                const passwordValue = passwordInput.value;

                // Load registered users from local storage
                let registeredUsers = JSON.parse(localStorage.getItem('shree_users')) || [];

                if (isSignUpMode) {
                    if (registeredUsers.some(u => u.name.toLowerCase() === nameValue.toLowerCase())) {
                        alert('This name is already registered. Please login.');
                        return;
                    }

                    // Updated regex: At least 8 chars, 1 upper, 1 lower, 1 number, 1 special char
                    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
                    if (!passwordRegex.test(passwordValue)) {
                        alert('Password does not meet requirements:\n- Minimum 8 characters\n- Uppercase, Lowercase, Number & Special Character');
                        passwordInput.focus();
                        return;
                    }

                    const newUser = {
                        name: nameValue,
                        email: document.getElementById('user-email') ? document.getElementById('user-email').value : '',
                        password: passwordValue,
                        phone: document.getElementById('user-contact').value || ''
                    };

                    registeredUsers.push(newUser);
                    localStorage.setItem('shree_users', JSON.stringify(registeredUsers));

                    alert('Registration successful! You can now log in.');
                    isSignUpMode = false;
                    toggleLoginMode.click();
                    return;
                } else {
                    // Check for hardcoded Admin Login first if in admin mode
                    if (isAdminLogin || (nameValue.toLowerCase() === 'admin' && passwordValue === 'admin123')) {
                        if (nameValue.toLowerCase() === 'admin' && passwordValue === 'admin123') {
                            localStorage.setItem('isLoggedIn', 'true');
                            currentUser.name = 'Administrator';
                            currentUser.email = 'admin@shreeevents.com';
                            currentUser.role = 'Administrator';
                            currentUser.avatar = `https://ui-avatars.com/api/?name=Admin&background=dc2626&color=fff`;
                            saveUser();

                            const submitBtn = splashLoginForm.querySelector('button');
                            submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Logging in Admin...`;
                            submitBtn.disabled = true;

                            setTimeout(() => {
                                window.location.href = 'admin.html';
                            }, 1500);
                            return;
                        } else if (isAdminLogin) {
                            alert('Invalid Admin Credentials.');
                            return;
                        }
                    }

                    // Regular User Login
                    const foundUser = registeredUsers.find(u => u.name.toLowerCase() === nameValue.toLowerCase() && u.password === passwordValue);
                    if (!foundUser) {
                        alert('Account not found or password incorrect. Please register first.');
                        return;
                    }
                    localStorage.setItem('isLoggedIn', 'true');
                    currentUser.name = foundUser.name;
                    currentUser.email = foundUser.email;
                    currentUser.phone = foundUser.phone;
                    currentUser.role = foundUser.role || 'User';
                    currentUser.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(foundUser.name)}&background=6366f1&color=fff`;
                    saveUser();
                }

                const submitBtn = splashLoginForm.querySelector('button');
                const actionText = isSignUpMode ? 'Registering...' : 'Logging in...';
                submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${actionText}`;
                submitBtn.disabled = true;

                setTimeout(() => {
                    splashLoginOverlay.classList.remove('active');
                    submitBtn.textContent = 'Login';
                    submitBtn.disabled = false;

                    // Update state before redirect
                    isProfileFilled = localStorage.getItem('isProfileFilled') === 'true';

                    // Redirect based on role
                    if (!isProfileFilled) {
                        showProfileOptionScreen();
                    } else {
                        window.location.hash = '#dashboard';
                        handleNavigation();
                    }

                    // Reset to login mode for next time
                    if (isSignUpMode) {
                        toggleLoginMode.click();
                    }
                }, 1500);
            });
        }

        function showProfileOptionScreen() {
            const profileContainer = document.getElementById('profile-completion-container');
            if (profileContainer && profileCompletionOverlay) {
                const originalHtml = `
                    <h2 style="margin-bottom: 10px; color: var(--primary-color);">Complete Your Profile</h2>
                    <p style="margin-bottom: 25px; font-size: 14px; color: #6b7280;">Please provide your details to continue to the website.</p>
                    <form id="profile-completion-form">
                        <div class="login-field"><i class="fa-solid fa-user"></i><input type="text" id="complete-fullname" placeholder="Full Name" required minlength="3"></div>

                        <div class="login-field"><i class="fa-solid fa-phone"></i><input type="tel" id="complete-phone" placeholder="Contact Number" required pattern="[0-9]{10}"></div>
                        <div class="login-field"><i class="fa-solid fa-city"></i><input type="text" id="complete-city" placeholder="City" required></div>
                        <div class="login-field"><i class="fa-solid fa-location-dot"></i><input type="text" id="complete-address" placeholder="Full Address" required></div>
                        <button type="submit" class="btn-login-submit">Complete & Enter</button>
                    </form>
                `;

                profileContainer.innerHTML = `
                    <div style="text-align: center; padding: 10px;">
                        <div style="font-size: 60px; color: #16a34a; margin-bottom: 20px;"><i class="fa-solid fa-circle-check"></i></div>
                        <h2 style="margin-bottom: 15px; color: var(--text-main);">Login Successful!</h2>
                        <p style="color: #6b7280; margin-bottom: 30px; line-height: 1.5;">Welcome to Shree Events. To provide you with the best experience, we need a few more details for your profile.</p>
                        <div style="display: flex; flex-direction: column; gap: 12px;">
                            <button class="btn-login-submit" id="start-profile-setup">
                                <i class="fa-solid fa-user-pen" style="margin-right: 8px;"></i> Fill Profile Details
                            </button>
                        </div>
                    </div>
                `;

                profileCompletionOverlay.classList.add('active');

                document.getElementById('start-profile-setup').addEventListener('click', () => {
                    profileContainer.innerHTML = originalHtml;
                    // Re-bind the form submit event
                    const newForm = document.getElementById('profile-completion-form');
                    if (newForm) bindProfileCompletionForm(newForm);
                });
            }
        }

        function bindProfileCompletionForm(form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();



                const submitBtn = form.querySelector('button');
                submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Finalizing...';
                submitBtn.disabled = true;

                setTimeout(() => {
                    // Save user data
                    currentUser.name = document.getElementById('complete-fullname').value;
                    currentUser.email = '';
                    currentUser.phone = document.getElementById('complete-phone').value;
                    currentUser.city = document.getElementById('complete-city').value;
                    currentUser.address = document.getElementById('complete-address').value;
                    currentUser.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=6366f1&color=fff`;

                    saveUser();
                    localStorage.setItem('isProfileFilled', 'true');
                    isProfileFilled = true; // Update local state variable

                    if (profileCompletionOverlay) profileCompletionOverlay.classList.remove('active');

                    // Restore close button if it was hidden
                    if (closeSplashLogin) closeSplashLogin.style.display = 'block';

                    window.location.hash = '#dashboard';
                    handleNavigation();

                    submitBtn.textContent = 'Complete & Enter';
                    submitBtn.disabled = false;
                }, 1500);
            });
        }
    }

    // Logout Logic
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('isProfileFilled');
                window.location.hash = ''; // Return to entrance
                window.location.reload(); // Refresh to clear states
            }
        });
    }

    // --- Data ---
    const servicesList = [
        { id: 1, name: 'Catering', icon: 'fa-utensils', image: 'https://www.sunjaya.com.my/wp-content/uploads/2019/11/Wedding-Catering-Fusion.jpg', desc: 'Premium food and beverage services for your guests.', options: ['Buffet System', 'Serving System'] },
        { id: 2, name: 'Flower Decoration', icon: 'fa-seedling', image: 'https://i.ytimg.com/vi/-sfVZqq9_z4/maxresdefault.jpg', desc: 'Beautiful floral arrangements for any occasion.', options: ['Normal Flower Decoration', 'Medium Flower Decoration', 'Luxury Flower Decoration'] },
        { id: 3, name: 'Naming Board', icon: 'fa-sign-hanging', image: 'https://www.partyone.in/suploads/2024/Dec/21/39157/1734779053image-146.webp', desc: 'Customized naming boards and signage.', options: ['Flower Decoration', 'Background Decoration', 'Catering Service', 'Return Gift', 'All of the Above'] },
        { id: 4, name: 'Walk Path', icon: 'fa-route', image: 'https://i.pinimg.com/originals/c8/a9/79/c8a9799846bef05fdc1649715dde59ae.jpg', desc: 'Elegant entryways and walking paths.', options: ['Normal Walk Path Arrangements', 'Medium Path Arrangements', 'Luxury Path Arrangements'] },
        { id: 6, name: 'Bouncers', icon: 'fa-user-shield', image: 'http://5.imimg.com/data5/SELLER/Default/2024/8/445534218/DL/KR/NY/64310247/bouncer-security-services-nashik-1000x1000.jpeg', desc: 'Professional security personnel for event safety.', options: ['4 members', '8 members', '12 members', 'Custom Count'], hasCustomInput: true },
        { id: 7, name: 'Mehandi Shastra', icon: 'fa-hand-sparkles', image: 'https://mahastudiosinc.com/wp-content/uploads/sites/28335/2022/11/What-is-a-Mehndi-Party-Guide.jpg', desc: 'Traditional Mehandi artists and designs.', options: ['Normal Design', 'Medium Design', 'Luxury Design'] },
        { id: 9, name: 'DJ Events', icon: 'fa-music', image: 'http://www.productlondon.com/wp-content/uploads/2024/05/creative_ideas_for_stage.jpg', desc: 'Professional DJs and sound systems.', options: ['Normal DJ Event', 'Medium DJ Event', 'Large DJ Event', 'Catering Service'], multiSelect: true }
    ];

    const eventsList = [
        { id: 5, name: 'Home Inauguration', icon: 'fa-house-chimney-crack', image: 'https://i.ytimg.com/vi/p8iKPLZDwJg/maxresdefault.jpg', desc: 'Traditional and modern inauguration ceremonies.', options: ['Lightings', 'Catering Service', 'Flower Decoration', 'Return Gifts', 'Pooja Management', 'Full Event Management'] },
        { id: 8, name: 'Birthday Celebration', icon: 'fa-cake-candles', image: 'https://www.styleevents.com.au/wp-content/uploads/2020/02/Black-Pink-Themed-21st-Birthday-Celebration-2-1400x933.jpg', desc: 'Complete birthday party planning and execution.', options: ['Background Decoration', 'Catering Service', 'Cake Order', 'Normal Full Package', 'Medium Full Package', 'Luxury Full Package', 'Full Event Management'] },
        { id: 10, name: 'Wedding Ceremony', icon: 'fa-ring', image: 'https://media.weddingz.in/images/39eba43cac42d75c0774490371fbdbfd/Wedding-Reception-Stage-Decoration-Ideas3.jpg', desc: 'Grand wedding planning with luxury arrangements.', options: ['Traditional Wedding', 'Destination Wedding', 'Royal Wedding', 'Reception Party', 'Full Event Management'] },
        { id: 11, name: 'Naming Ceremony', icon: 'fa-baby', image: 'https://i.pinimg.com/originals/eb/73/77/eb73778ed5ff7ba0238fbd88df22f58d.jpg', desc: 'Memorable naming ceremonies for your little ones.', options: ['Cradle Decoration', 'Catering', 'Photography', 'Full Event Management'] },
        { id: 12, name: 'Corporate Events', icon: 'fa-briefcase', image: 'https://www.rebeccachan.ca/wp-content/uploads/2023/12/46_LEE_0110.jpg', desc: 'Professional corporate meetings, seminars, and parties.', options: ['Seminar Setup', 'Product Launch', 'Annual Meet', 'Team Building Activities', 'Full Event Management'] }
    ];

    let cartList = JSON.parse(localStorage.getItem('shree_cart')) || [];
    let pendingBookings = JSON.parse(localStorage.getItem('shree_pending_bookings')) || [];
    let approvedBookings = JSON.parse(localStorage.getItem('shree_approved_bookings')) || [];
    let cancelledBookings = JSON.parse(localStorage.getItem('shree_cancelled_bookings')) || [];

    function saveCart() {
        localStorage.setItem('shree_cart', JSON.stringify(cartList));
    }

    function savePending() {
        localStorage.setItem('shree_pending_bookings', JSON.stringify(pendingBookings));
    }

    function saveApproved() {
        localStorage.setItem('shree_approved_bookings', JSON.stringify(approvedBookings));
    }

    function saveCancelled() {
        localStorage.setItem('shree_cancelled_bookings', JSON.stringify(cancelledBookings));
    }

    function syncData() {
        cartList = JSON.parse(localStorage.getItem('shree_cart')) || [];
        pendingBookings = JSON.parse(localStorage.getItem('shree_pending_bookings')) || [];
        approvedBookings = JSON.parse(localStorage.getItem('shree_approved_bookings')) || [];
        cancelledBookings = JSON.parse(localStorage.getItem('shree_cancelled_bookings')) || [];
    }

    // User Data State
    const userData = JSON.parse(localStorage.getItem('userData'));

    const currentUser = userData || {
        name: 'Shree Events',
        phone: '',
        email: 'info@shreeevents.com',
        city: '',
        address: '',
        role: 'User',
        avatar: 'https://ui-avatars.com/api/?name=Shree+Events&background=6366f1&color=fff'
    };

    function saveUser() {
        localStorage.setItem('userData', JSON.stringify(currentUser));
        updateSidebarUser();
    }

    function updateSidebarUser() {
        const sidebarName = document.querySelector('.user-info h4');
        const sidebarAvatar = document.querySelector('.user-profile-mini img');
        const sidebarProfileCard = document.querySelector('.user-profile-mini');
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

        if (sidebarProfileCard) {
            sidebarProfileCard.style.display = isLoggedIn ? 'flex' : 'none';
        }

        if (isLoggedIn) {
            if (sidebarName) sidebarName.textContent = currentUser.name;
            if (sidebarAvatar) sidebarAvatar.src = currentUser.avatar;
        }
    }

    // --- Elements ---
    const toggleBtn = document.querySelector('.toggle-menu');
    const sidebar = document.querySelector('.sidebar');
    const navItems = document.querySelectorAll('.nav-links li');
    const pageHeader = document.getElementById('page-header');
    const contentArea = document.getElementById('content-area');

    // Cart Elements
    const cartBtn = document.getElementById('cart-btn');
    const cartCountEl = document.getElementById('cart-count');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const closeCartBtn = document.getElementById('close-cart');
    const cartItemsContainer = document.getElementById('cart-items');
    const checkoutBtn = document.getElementById('checkout-btn');

    // --- Interaction Logic ---
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 992) {
                if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target) && sidebar.classList.contains('active')) {
                    sidebar.classList.remove('active');
                }
            }
        });
    }

    // Cart Logic
    function toggleCart() {
        if (cartSidebar && cartOverlay) {
            cartSidebar.classList.toggle('active');
            cartOverlay.classList.toggle('active');
        }
    }

    if (cartBtn) cartBtn.addEventListener('click', toggleCart);
    if (closeCartBtn) closeCartBtn.addEventListener('click', toggleCart);
    if (cartOverlay) cartOverlay.addEventListener('click', toggleCart);

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cartList.length === 0) {
                alert('Please select at least one event before checking out.');
                return;
            }

            if (confirm('Are you sure you want to proceed with the booking for these ' + cartList.length + ' events?')) {
                // Simulate processing
                checkoutBtn.disabled = true;
                checkoutBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';

                setTimeout(() => {
                    // Move cart to pending
                    const now = new Date();
                    const newPending = cartList.map((item, idx) => ({
                        ...item,
                        bookingId: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
                        customerName: currentUser.name,
                        email: currentUser.email,
                        mobileNumber: currentUser.phone,
                        date: now.toLocaleDateString(),
                        status: 'Pending'
                    }));

                    pendingBookings = [...pendingBookings, ...newPending];
                    savePending();

                    alert('Success! Your booking request has been sent for approval.');
                    cartList = [];
                    updateCartUI();
                    checkoutBtn.disabled = false;
                    checkoutBtn.innerHTML = 'Checkout';
                    toggleCart();

                    // If on dashboard, re-render to reflect changes
                    const hash = window.location.hash.toLowerCase();
                    if (hash.includes('dashboard') || hash.includes('booking')) {
                        handleNavigation();
                    }
                }, 1500);
            }
        });
    }

    // Dropdown Logic
    const notificationsBtn = document.getElementById('notifications-btn');
    const notificationsPanel = document.getElementById('notifications-panel');
    const settingsBtn = document.getElementById('settings-btn');
    const settingsPanel = document.getElementById('settings-panel');

    function toggleDropdown(btn, panel) {
        // Close others
        document.querySelectorAll('.dropdown-menu').forEach(el => {
            if (el !== panel) el.classList.remove('active');
        });
        panel.classList.toggle('active');
    }

    if (notificationsBtn && notificationsPanel) {
        notificationsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDropdown(notificationsBtn, notificationsPanel);
        });
    }

    if (settingsBtn && settingsPanel) {
        settingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDropdown(settingsBtn, settingsPanel);
        });
    }

    // Sidebar Dropdown Toggle
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            const parent = toggle.closest('.has-dropdown');

            // Close other open sub-navs
            document.querySelectorAll('.has-dropdown').forEach(item => {
                if (item !== parent) item.classList.remove('open');
            });

            parent.classList.toggle('open');
        });
    });

    // Close Dropdowns on Click Outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown-wrapper')) {
            document.querySelectorAll('.dropdown-menu').forEach(el => {
                el.classList.remove('active');
            });
        }
    });

    function updateSidebarBadges() {
        // Sync counts from localStorage
        const pending = JSON.parse(localStorage.getItem('shree_pending_bookings')) || [];
        const approved = JSON.parse(localStorage.getItem('shree_approved_bookings')) || [];
        const cancelled = JSON.parse(localStorage.getItem('shree_cancelled_bookings')) || [];

        const badgeNew = document.getElementById('badge-new-booking');
        const badgeApproved = document.getElementById('badge-approved-booking');
        const badgeCancelled = document.getElementById('badge-cancelled-booking');

        if (badgeNew) {
            const count = pending.length;
            badgeNew.textContent = count;
            badgeNew.style.display = count > 0 ? 'inline-block' : 'none';
            if (count > 0) badgeNew.classList.add('pulse');
            else badgeNew.classList.remove('pulse');
        }

        if (badgeApproved) {
            const count = approved.length;
            badgeApproved.textContent = count;
            badgeApproved.style.display = count > 0 ? 'inline-block' : 'none';
        }

        if (badgeCancelled) {
            const count = cancelled.length;
            badgeCancelled.textContent = count;
            badgeCancelled.style.display = count > 0 ? 'inline-block' : 'none';
        }
    }

    function updateCartUI() {
        saveCart();
        updateSidebarBadges(); // Update sidebar badges whenever cart changes
        // Update Count
        if (cartCountEl) {
            const count = cartList.length;
            cartCountEl.textContent = count;

            if (count === 0) {
                cartCountEl.style.display = 'none';
            } else {
                cartCountEl.style.display = 'flex';
                // Bump animation
                cartCountEl.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    cartCountEl.style.transform = 'scale(1)';
                }, 200);
            }
        }

        // Render Items
        if (cartItemsContainer) {
            if (cartList.length === 0) {
                cartItemsContainer.innerHTML = `
                <div class="empty-cart-msg">
                    <i class="fa-solid fa-calendar-check"></i>
                    <p>No events selected</p>
                </div>
            `;
            } else {
                cartItemsContainer.innerHTML = '';
                cartList.forEach((item, index) => {
                    const itemEl = document.createElement('div');
                    itemEl.className = 'cart-item';
                    itemEl.innerHTML = `
                    <div class="icon-box purple" style="width: 40px; height: 40px; font-size: 16px;">
                        <i class="fa-solid ${item.icon}"></i>
                    </div>
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>${item.selectedOption ? item.selectedOption : 'Service Item'}</p>
                    </div>
                    <button class="btn-remove" data-index="${index}">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                `;
                    cartItemsContainer.appendChild(itemEl);
                });
            }
        }
    }

    // Add to Cart
    if (contentArea) {
        contentArea.addEventListener('click', (e) => {
            if (e.target.closest('.btn-add-cart')) {
                const btn = e.target.closest('.btn-add-cart');
                const eventId = parseInt(btn.dataset.id);
                const allItems = [...eventsList, ...servicesList];
                const eventItem = allItems.find(ev => ev.id === eventId);

                if (eventItem) {
                    // Create a copy to not modify original list and store selected option
                    const cartItem = { ...eventItem };

                    // Check if there's a select option for this item
                    const selectEl = document.getElementById(`select-opt-${eventId}`);
                    if (selectEl) {
                        cartItem.selectedOption = selectEl.value;
                    }

                    // Check for multi-select (DJ Events)
                    const checkBoxes = document.querySelectorAll(`input[name="opt-${eventId}"]:checked`);
                    if (checkBoxes.length > 0) {
                        const selectedValues = Array.from(checkBoxes).map(cb => cb.value);
                        cartItem.selectedOption = selectedValues.join(', ');
                    }

                    // Check for custom inputs
                    const customMembersEl = document.getElementById(`custom-members-${eventId}`);
                    const eventDescEl = document.getElementById(`event-desc-${eventId}`);

                    if (customMembersEl && customMembersEl.value) {
                        cartItem.selectedOption = `${cartItem.selectedOption || ''} (${customMembersEl.value} Members)`.trim();
                    }
                    if (eventDescEl && eventDescEl.value) {
                        cartItem.selectedOption = `${cartItem.selectedOption || ''} - ${eventDescEl.value}`.trim();
                    }

                    // Add to list
                    cartList.push(cartItem);
                    updateCartUI();

                    // Open Cart automatically to show the user (Connection)
                    if (!cartSidebar.classList.contains('active')) {
                        toggleCart();
                    }

                    // Button Feedback
                    const originalText = btn.innerHTML;
                    btn.innerHTML = '<i class="fa-solid fa-check"></i> Added';
                    btn.style.backgroundColor = '#dcfce7';
                    btn.style.color = '#166534';
                    btn.style.borderColor = '#dcfce7';

                    setTimeout(() => {
                        btn.innerHTML = originalText;
                        btn.style.backgroundColor = '';
                        btn.style.color = '';
                        btn.style.borderColor = '';
                    }, 2000);
                }
            }

            if (e.target.closest('.action-delete')) {
                const btn = e.target.closest('.action-delete');
                const index = parseInt(btn.dataset.index);
                const hash = window.location.hash.substring(1);

                if (confirm('Are you sure you want to delete this booking record permanently?')) {
                    const getFilteredIndices = (list) => {
                        return list.filter(item => (item.customerName === currentUser.name) || (item.email === currentUser.email));
                    };

                    if (hash === 'new-booking') {
                        const filtered = getFilteredIndices(cartList);
                        const itemToDelete = filtered[index];
                        const actualIndex = cartList.indexOf(itemToDelete);
                        if (actualIndex > -1) {
                            cartList.splice(actualIndex, 1);
                            saveCart();
                            updateCartUI();
                        }
                    } else if (hash === 'approved-booking') {
                        const filtered = getFilteredIndices(approvedBookings);
                        const itemToDelete = filtered[index];
                        const actualIndex = approvedBookings.indexOf(itemToDelete);
                        if (actualIndex > -1) {
                            approvedBookings.splice(actualIndex, 1);
                            saveApproved();
                        }
                    } else if (hash === 'cancelled-booking') {
                        const filtered = getFilteredIndices(cancelledBookings);
                        const itemToDelete = filtered[index];
                        const actualIndex = cancelledBookings.indexOf(itemToDelete);
                        if (actualIndex > -1) {
                            cancelledBookings.splice(actualIndex, 1);
                            saveCancelled();
                        }
                    }
                    renderBookings(hash);
                }
            }

            if (e.target.closest('.action-view') || e.target.closest('.action-edit')) {
                const btn = e.target.closest('.action-view') || e.target.closest('.action-edit');
                const index = parseInt(btn.dataset.index);
                const isView = btn.classList.contains('action-view');
                const hash = window.location.hash.substring(1);

                const getFiltered = (list) => {
                    return list.filter(item => (item.customerName === currentUser.name) || (item.email === currentUser.email));
                };

                let itemData;
                if (hash === 'new-booking') {
                    const filtered = getFiltered(cartList);
                    const baseItem = filtered[index];
                    if (baseItem) {
                        itemData = {
                            ...baseItem,
                            bookingId: baseItem.bookingId || `BK-100${index + 1}`,
                            customerName: baseItem.customerName || currentUser.name,
                            mobileNumber: baseItem.mobileNumber || currentUser.phone || '9876543210',
                            email: baseItem.email || currentUser.email,
                            date: baseItem.eventDate || baseItem.date || '15 Jan 2026',
                            service: baseItem.service || baseItem.name,
                            eventType: baseItem.eventType || baseItem.name
                        };
                    }
                } else if (hash === 'approved-booking') {
                    const filtered = getFiltered(approvedBookings);
                    itemData = filtered[index];
                } else if (hash === 'cancelled-booking') {
                    const filtered = getFiltered(cancelledBookings);
                    itemData = filtered[index];
                }

                if (itemData) showBookingForm(itemData, isView);
            }
        });
    }

    // Remove from Cart
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', (e) => {
            if (e.target.closest('.btn-remove')) {
                const btn = e.target.closest('.btn-remove');
                const index = parseInt(btn.dataset.index);
                cartList.splice(index, 1);
                updateCartUI();
                // If on dashboard, re-render to reflect changes
                if (window.location.hash.includes('dashboard')) renderDashboard();
            }
        });
    }

    // Dashboard Remove Listener
    window.addEventListener('remove-from-dashboard', (e) => {
        const index = e.detail;
        cartList.splice(index, 1);
        updateCartUI();
        renderDashboard();
    });

    // --- Rendering Functions ---

    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    function renderDashboard() {
        const totalServices = servicesList.length;
        const totalEvents = eventsList.length;
        const newBookings = cartList.length;

        contentArea.innerHTML = `
            <div class="dashboard-stats">
                <div style="grid-column: 1 / -1; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h2 style="font-size: 28px; font-weight: 700; color: var(--text-main);">Welcome! 👋</h2>
                        <p style="color: var(--text-muted);">Here's what's happening with your events today.</p>
                    </div>
                </div>
                <div class="stat-card" style="cursor: pointer;" onclick="window.location.hash='#new-booking'">
                    <div class="icon-box purple"><i class="fa-solid fa-ticket"></i></div>
                    <div class="stat-info">
                        <h3>Total New Booking</h3>
                        <p class="number" id="stat-new">${newBookings}</p>
                        <p class="trend ${newBookings > 0 ? 'up' : ''}">${newBookings > 0 ? '+ New' : 'Empty'}</p>
                    </div>
                </div>
                <div class="stat-card" style="cursor: pointer;" onclick="window.location.hash='#approved-booking'">
                    <div class="icon-box green"><i class="fa-solid fa-check-circle"></i></div>
                    <div class="stat-info">
                        <h3>Total Approved Booking</h3>
                        <p class="number" id="stat-approved">${approvedBookings.length}</p>
                        <p class="trend up">Active</p>
                    </div>
                </div>
                <div class="stat-card" style="cursor: pointer;" onclick="window.location.hash='#cancelled-booking'">
                    <div class="icon-box orange"><i class="fa-solid fa-circle-xmark"></i></div>
                    <div class="stat-info">
                        <h3>Total Cancelled Booking</h3>
                        <p class="number" id="stat-cancelled">${cancelledBookings.length}</p>
                        <p class="trend down">inactive</p>
                    </div>
                </div>
                <div class="stat-card" style="cursor: pointer;" onclick="window.location.hash='#events'">
                    <div class="icon-box blue"><i class="fa-solid fa-bell-concierge"></i></div>
                    <div class="stat-info">
                        <h3>Total Services</h3>
                        <p class="number" id="stat-services">${totalServices}</p>
                        <p class="trend">Active</p>
                    </div>
                </div>
            </div>

            <div class="dashboard-grid">
                <div class="recent-section">
                    <div class="section-header">
                        <h2>Recent Activities</h2>
                        <button class="btn-primary" onclick="window.location.hash='#events'">Browse Services</button>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Event Name</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Wedding Ceremony</td>
                                    <td>24 Oct 2023</td>
                                    <td><span class="status completed">Completed</span></td>
                                    <td><button class="icon-btn"><i class="fa-solid fa-ellipsis-vertical"></i></button></td>
                                </tr>
                                <tr>
                                    <td>Corporate DJ Night</td>
                                    <td>28 Oct 2023</td>
                                    <td><span class="status pending">Pending</span></td>
                                    <td><button class="icon-btn"><i class="fa-solid fa-ellipsis-vertical"></i></button></td>
                                </tr>
                                <tr>
                                    <td>Flower Decoration</td>
                                    <td>02 Nov 2023</td>
                                    <td><span class="status confirmed">Confirmed</span></td>
                                    <td><button class="icon-btn"><i class="fa-solid fa-ellipsis-vertical"></i></button></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    ${(() => {
                const itemsToShow = cartList.filter(item =>
                    (item.customerName === currentUser.name) ||
                    (item.email === currentUser.email) ||
                    (!item.customerName && !item.email) // Show if newly added and not yet associated with a user
                );

                if (itemsToShow.length === 0) return '';

                return `
                        <div class="section-header" style="margin-top: 32px;">
                            <h2>Current Selected Events</h2>
                        </div>
                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Service</th>
                                        <th>Selected Option</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${itemsToShow.map((item, index) => {
                    // Find original index in cartList for delete action
                    const originalIndex = cartList.indexOf(item);
                    return `
                                        <tr>
                                            <td>
                                                <div style="display: flex; align-items: center; gap: 10px;">
                                                    <div class="mini-icon" style="width: 30px; height: 30px; font-size: 12px;"><i class="fa-solid ${item.icon}"></i></div>
                                                    ${item.name}
                                                </div>
                                            </td>
                                            <td>${item.selectedOption || 'Standard Service'}</td>
                                            <td><span class="status confirmed">In Cart</span></td>
                                            <td>
                                                <button class="btn-remove" data-index="${originalIndex}" onclick="this.closest('tr').style.opacity='0'; setTimeout(() => { window.dispatchEvent(new CustomEvent('remove-from-dashboard', {detail: ${originalIndex}})) }, 300)">
                                                    <i class="fa-solid fa-trash-can"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    `}).join('')}
                                </tbody>
                            </table>
                        </div>
                    `;
            })()}
                </div>
                </div>
            </div>
        `;

        // Animate the numbers
        setTimeout(() => {
            const newEl = document.getElementById('stat-new');
            const approvedEl = document.getElementById('stat-approved');
            const cancelledEl = document.getElementById('stat-cancelled');
            const servicesEl = document.getElementById('stat-services');

            if (newEl) animateValue(newEl, 0, newBookings, 800);
            if (approvedEl) animateValue(approvedEl, 0, approvedBookings.length, 1200);
            if (cancelledEl) animateValue(cancelledEl, 0, cancelledBookings.length, 1000);
            if (servicesEl) animateValue(servicesEl, 0, totalServices + totalEvents, 1000);
        }, 100);
    }

    function renderEvents(listToRender, filter = '') {
        const filteredEvents = listToRender.filter(event =>
            event.name.toLowerCase().includes(filter.toLowerCase()) ||
            event.desc.toLowerCase().includes(filter.toLowerCase())
        );

        if (filteredEvents.length === 0) {
            return `
                <div class="empty-search" style="text-align: center; padding: 50px; width: 100%;">
                    <i class="fa-solid fa-magnifying-glass" style="font-size: 48px; color: #e5e7eb; margin-bottom: 16px; display: block;"></i>
                    <h3 style="color: #374151;">No results found for "${filter}"</h3>
                    <p style="color: #6b7280; margin-top: 8px;">Try searching for different keywords or browse all services.</p>
                    <button class="btn-primary" style="margin-top: 20px;" onclick="document.getElementById('search-input').value=''; window.dispatchEvent(new HashChangeEvent('hashchange'));">Clear Search</button>
                </div>
            `;
        }

        let html = '<div class="event-grid">';
        filteredEvents.forEach(event => {
            html += `
                <div class="event-card">
                    <div class="event-icon-area">
                        ${event.image ? `<img src="${event.image}" alt="${event.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit;">` : `<i class="fa-solid ${event.icon}"></i>`}
                    </div>
                    <div class="event-details">
                        <div>
                            <h3 style="font-weight: 800;">${event.name}</h3>
                            <p>${event.desc}</p>
                             ${event.options ? `
                                <div class="option-select-container">
                                    <label>Select Service</label>
                                    ${event.multiSelect ? `
                                        <div class="multi-select-box" style="display: flex; flex-direction: column; gap: 8px; margin-top: 10px; margin-bottom: 20px;">
                                            ${event.options.map((opt, i) => `
                                                <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; text-transform: none; font-size: 14px; color: var(--text-main); font-weight: 500;">
                                                    <input type="checkbox" name="opt-${event.id}" value="${opt}" style="width: 18px; height: 18px; cursor: pointer;" onchange="
                                                        const checked = document.querySelectorAll('input[name=\'opt-${event.id}\']:checked');
                                                        if(checked.length > 2) { 
                                                            this.checked = false;
                                                            alert('You can select a maximum of 2 options.');
                                                        }
                                                    ">
                                                    ${opt}
                                                </label>
                                            `).join('')}
                                        </div>
                                    ` : `
                                        <select class="service-select" id="select-opt-${event.id}">
                                            ${event.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                                        </select>
                                    `}
                                </div>
                            ` : ''}
                            ${event.hasCustomInput ? `
                                <div class="custom-inputs-container" style="margin-top: -10px; margin-bottom: 20px;">
                                    <div class="form-group" style="margin-bottom: 12px;">
                                        <label style="display: block; font-size: 12px; font-weight: 700; color: #6b7280; margin-bottom: 8px; text-transform: uppercase;">Custom Member Count</label>
                                        <input type="number" id="custom-members-${event.id}" placeholder="Enter number of members" class="service-select" style="background-image: none;">
                                    </div>
                                    <div class="form-group">
                                        <label style="display: block; font-size: 12px; font-weight: 700; color: #6b7280; margin-bottom: 8px; text-transform: uppercase;">Event Details</label>
                                        <input type="text" id="event-desc-${event.id}" placeholder="Enter your event" class="service-select" style="background-image: none;">
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                        <button class="btn-add-cart" data-id="${event.id}">
                            Choose Your Event
                        </button>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        return html;
    }

    function renderProfile() {
        return `
            <div class="profile-container">
                <div class="profile-header">
                    <div class="profile-avatar-wrapper">
                        <img src="https://ui-avatars.com/api/?name=Admin+User&background=6366f1&color=fff&size=128" alt="Profile" class="profile-avatar" id="profile-preview">
                        <button type="button" class="profile-upload-btn" onclick="document.getElementById('profile-upload').click()">
                            <i class="fa-solid fa-camera"></i>
                        </button>
                        <input type="file" id="profile-upload" accept="image/*" hidden>
                    </div>
                    <h2>Edit Profile</h2>
                    <p style="color: #6b7280;">Manage your personal information</p>
                </div>
                <form class="profile-form" id="profile-form">
                    <div class="form-group">
                        <label>Full Name</label>
                        <input type="text" name="name" value="${currentUser.name}" placeholder="Enter your full name" required minlength="3">
                    </div>
                    <div class="form-group">
                        <label>Phone Number</label>
                        <input type="tel" name="phone" value="${currentUser.phone}" placeholder="Enter your phone number" required pattern="[0-9]{10}">
                    </div>
                    <div class="form-group">
                        <label>Email ID</label>
                        <input type="email" name="email" value="${currentUser.email}" placeholder="Enter your email" required>
                    </div>
                    <div class="form-group">
                        <label>City</label>
                        <input type="text" name="city" value="${currentUser.city}" placeholder="Enter your city" required>
                    </div>
                    <div class="form-group">
                        <label>Address</label>
                        <textarea name="address" rows="3" placeholder="Enter your full address" required>${currentUser.address}</textarea>
                    </div>
                    <div class="form-actions" style="opacity: 0.5; pointer-events: none;" id="save-btn-container">
                        <button type="submit" class="btn-primary" id="save-profile-btn">
                            Save Changes
                        </button>
                    </div>
                </form>
                <div class="success-msg" id="profile-success-msg">
                    <i class="fa-solid fa-check-circle"></i> Profile details updated successfully!
                </div>
            </div>
        `;
    }

    function renderDefault(title) {
        return `
            <div class="recent-section" style="text-align: center; padding: 50px;">
                <div class="icon-box purple" style="margin: 0 auto 20px; width: 80px; height: 80px; font-size: 30px;">
                    <i class="fa-solid fa-layer-group"></i>
                </div>
                <h2>${title} Ready</h2>
                <p style="color: #6b7280; margin-top: 10px;">This module is fully integrated into the layout styling.</p>
                <button class="btn-primary" style="margin-top: 20px;">Create New Item</button>
            </div>
        `;
    }

    // --- Navigation Handling ---
    function handleNavigation() {
        syncData();
        updateSidebarBadges(); // Added dynamic sidebar updates
        const rawHash = window.location.hash.substring(1).toLowerCase(); // Case-insensitive handling
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const isProfileFilled = localStorage.getItem('isProfileFilled') === 'true';

        // Use browser history to show/hide splash
        if (!isGuestMode && (rawHash === '' || rawHash === 'entrance' || !isLoggedIn || !isProfileFilled)) {
            // Ensure profile completion is NOT visible if not logged in
            if (!isLoggedIn) {
                if (profileCompletionOverlay) profileCompletionOverlay.classList.remove('active');
            }

            // If not logged in and trying to access a page, force entrance
            if (!isLoggedIn && rawHash !== '' && rawHash !== 'entrance') {
                window.location.hash = '';
                return;
            }

            // If logged in but profile not filled, show profile overlay
            if (isLoggedIn && !isProfileFilled) {
                showSplash();
                showProfileOptionScreen();
                if (splashLoginOverlay) splashLoginOverlay.classList.remove('active');
                return;
            }

            showSplash();
            // Don't process further if we're showing the entrance
            return;
        } else {
            hideSplash();
            if (profileCompletionOverlay) profileCompletionOverlay.classList.remove('active');
        }

        let defaultHash = 'dashboard';
        const hash = rawHash || defaultHash;
        const searchInput = document.getElementById('search-input');
        const query = searchInput ? searchInput.value : '';

        // Update Title
        const title = hash.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        pageHeader.textContent = title;

        // Update Active Link
        navItems.forEach(item => item.classList.remove('active'));
        // Find link that ends with #hash or is exactly #hash
        const activeLink = Array.from(document.querySelectorAll('.nav-links a')).find(a =>
            a.getAttribute('href').endsWith(`#${hash}`)
        );
        if (activeLink) {
            activeLink.parentElement.classList.add('active');
        }

        // --- Update Magic Nav Active State ---
        const magicLinks = document.querySelectorAll('.navigation li');
        magicLinks.forEach(item => item.classList.remove('active'));
        const activeMagicLink = Array.from(document.querySelectorAll('.navigation li a')).find(a =>
            a.getAttribute('href').endsWith(`#${hash}`)
        );
        if (activeMagicLink) {
            activeMagicLink.parentElement.classList.add('active');
        }

        // Update Content
        if (hash === 'dashboard') {
            renderDashboard();
        } else if (hash === 'events') {
            contentArea.innerHTML = renderEvents(eventsList, query);
        } else if (hash === 'services') {
            contentArea.innerHTML = renderEvents(servicesList, query);
        } else if (hash === 'all-options') {
            const allOptions = [...eventsList, ...servicesList];
            contentArea.innerHTML = renderEvents(allOptions, query);
        } else if (hash === 'profile') {
            contentArea.innerHTML = renderProfile();
            bindProfileEvents();
        } else if (hash === 'contact-shree-events') {
            contentArea.innerHTML = `
                <div class="recent-section" style="padding: 0; min-height: 100vh; overflow: hidden;">
                    <div class="visme_d" 
                         data-title="webinar registration form" 
                         data-url="g7ddqxx0-untitled-projects,fullpage=true" 
                         data-domain="form" 
                         data-full-page="true" 
                         data-min-height="100vh" 
                         data-form-id="133190">
                    </div>
                </div>
            `;
            // Re-run visme script logic if available
            if (window.vismeForms) window.vismeForms.init();
        } else if (hash === 'new-booking' || hash === 'approved-booking' || hash === 'cancelled-booking') {
            contentArea.innerHTML = renderBookings(hash);

        } else if (hash === 'company') {
            contentArea.innerHTML = `
                <div class="recent-section">
                    <div class="section-header"><h2>Company Information</h2></div>
                    <div style="padding: 20px; text-align: center;">
                        <img src="https://ui-avatars.com/api/?name=Shree+Events&background=6366f1&color=fff&size=128" style="border-radius: 50%; margin-bottom: 20px;">
                        <h3>Shree Events Management</h3>
                        <p style="color: #6b7280; max-width: 600px; margin: 10px auto;">We are a premium event management company dedicated to making your special moments unforgettable. From weddings to corporate events, we handle it all with elegance and precision.</p>
                        <div style="margin-top: 30px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; text-align: left;">
                            <div class="stat-card">
                                <div class="icon-box purple"><i class="fa-solid fa-map-location-dot"></i></div>
                                <div><h4>Headquarters</h4><p class="text-muted">Mumbai, India</p></div>
                            </div>
                            <div class="stat-card">
                                <div class="icon-box green"><i class="fa-solid fa-phone"></i></div>
                                <div><h4>Contact</h4><p class="text-muted">+91 98765 43210</p></div>
                            </div>
                            <div class="stat-card">
                                <div class="icon-box blue"><i class="fa-solid fa-envelope"></i></div>
                                <div><h4>Email</h4><p class="text-muted">info@shreeevents.com</p></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            contentArea.innerHTML = renderDefault(title);
        }
    }



    function renderBookings(type) {
        let title = "Bookings";
        let data = [];

        if (type === 'new-booking') {
            title = "New Booking Requests";
            data = pendingBookings.filter(item =>
                (item.customerName === currentUser.name) ||
                (item.email === currentUser.email)
            );
        } else if (type === 'approved-booking') {
            title = "Approved Bookings";
            data = approvedBookings.filter(item => (item.customerName === currentUser.name) || (item.email === currentUser.email));
        } else if (type === 'cancelled-booking') {
            title = "Cancelled Bookings";
            data = cancelledBookings.filter(item => (item.customerName === currentUser.name) || (item.email === currentUser.email));
        }

        return `
            <div class="recent-section">
                <div class="section-header">
                    <h2>${title}</h2>
                    ${type === 'new-booking' ? `<button class="btn-primary" onclick="showBookingForm()"><i class="fa-solid fa-plus"></i> Create New Booking</button>` : ''}
                </div>
                <div class="table-container" style="background: var(--bg-white); border-radius: 12px; padding: 20px; box-shadow: var(--shadow-sm); overflow-x: auto;">
                    <table style="width: 100%; min-width: 800px;">
                        <thead>
                            <tr>
                                <th>Booking ID</th>
                                <th>Customer Name</th>
                                <th>Mobile Number</th>
                                <th>Email</th>
                                <th>Booking Date</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.length === 0 ? `<tr><td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted);">No bookings found in this category.</td></tr>` :
                data.map((item, index) => `
                                <tr>
                                    <td><span style="font-weight: 600; color: var(--primary-color);">${item.bookingId || 'PENDING'}</span></td>
                                    <td>${item.customerName || 'N/A'}</td>
                                    <td>${item.mobileNumber || 'N/A'}</td>
                                    <td>${item.email || 'N/A'}</td>
                                    <td>${item.date || 'N/A'}</td>
                                    <td><span class="status ${item.status && item.status.toLowerCase() === 'approved' ? 'completed' : (item.status && item.status.toLowerCase() === 'cancelled' ? 'emergency' : 'confirmed')}">${item.status || 'Pending'}</span></td>
                                    <td>
                                        <div style="display: flex; gap: 8px;">
                                            <button class="icon-btn action-view" title="View Details" data-index="${index}"><i class="fa-solid fa-eye"></i></button>
                                            ${type === 'new-booking' ? `<button class="icon-btn action-edit" title="Edit" data-index="${index}"><i class="fa-solid fa-pen-to-square"></i></button>` : ''}
                                            <button class="icon-btn action-delete" style="color: var(--danger-color);" title="Delete Record" data-index="${index}"><i class="fa-solid fa-trash-can"></i></button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Booking Form Modal -->
            <div id="booking-modal" class="cart-overlay" style="display: none; opacity: 1; visibility: visible; align-items: center; justify-content: center;">
                <div class="profile-container" style="max-width: 700px; width: 90%; margin: 20px; animation: slideIn 0.3s ease-out; background: white; border-radius: 16px; overflow: hidden; padding: 0; max-height: 90vh; overflow-y: auto;">
                    <div class="cart-header" style="padding: 20px; border-bottom: 1px solid var(--border-color);">
                        <h2 id="modal-title">Create New Booking</h2>
                        <button class="close-cart" onclick="closeBookingForm()"><i class="fa-solid fa-xmark"></i></button>
                    </div>
                    <form id="new-booking-form" style="padding: 24px;">
                        <input type="hidden" name="bookingId" id="form-booking-id">
                        
                        <!-- Customer Information -->
                        <h3 style="margin-bottom: 16px; color: var(--primary-color); font-size: 16px; font-weight: 600;">Customer Information</h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div class="form-group">
                                <label>Customer Name</label>
                                <input type="text" name="customerName" id="form-name" required placeholder="Enter customer name" value="${currentUser.name}">
                            </div>
                            <div class="form-group">
                                <label>Mobile Number</label>
                                <input type="tel" name="mobile" id="form-mobile" required placeholder="Enter mobile number" value="${currentUser.phone || ''}">
                            </div>
                        </div>
                        <div class="form-group" style="margin-top: 16px;">
                            <label>Email Address</label>
                            <input type="email" name="email" id="form-email" required placeholder="Enter email address" value="${currentUser.email}">
                        </div>

                        <!-- Event Details -->
                        <h3 style="margin: 24px 0 16px; color: var(--primary-color); font-size: 16px; font-weight: 600;">Event Details</h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div class="form-group">
                                <label>Type of Event</label>
                                <select name="eventType" id="form-event-type" required class="service-select" style="background-image: none;">
                                    <option value="">Select Event Type</option>
                                    <optgroup label="Events">
                                        ${eventsList.map(ev => `<option value="${ev.name}">${ev.name}</option>`).join('')}
                                    </optgroup>
                                    <optgroup label="Services">
                                        ${servicesList.map(ev => `<option value="${ev.name}">${ev.name}</option>`).join('')}
                                    </optgroup>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Event Date</label>
                                <input type="date" name="eventDate" id="form-event-date" required value="${new Date().toISOString().split('T')[0]}">
                            </div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px;">
                            <div class="form-group">
                                <label>Event Starting Time</label>
                                <input type="time" name="startTime" id="form-start-time" required placeholder="Select start time">
                            </div>
                            <div class="form-group">
                                <label>Event Finishing Time</label>
                                <input type="time" name="endTime" id="form-end-time" required placeholder="Select end time">
                            </div>
                        </div>

                        <div class="form-group" style="margin-top: 16px;">
                            <label>Venue Address</label>
                            <textarea name="venueAddress" id="form-venue-address" required placeholder="Enter complete venue address" rows="3" style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; font-family: inherit; resize: vertical;"></textarea>
                        </div>

                        <div class="form-actions" style="margin-top: 32px;" id="modal-footer">
                            <button type="submit" id="submit-booking-btn" class="btn-primary" style="width: 100%;">Create Booking Record</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    // Modal Helpers
    window.showBookingForm = (data = null, readOnly = false) => {
        const modal = document.getElementById('booking-modal');
        const form = document.getElementById('new-booking-form');
        const title = document.getElementById('modal-title');
        const submitBtn = document.getElementById('submit-booking-btn');
        const inputs = form.querySelectorAll('input, select, textarea');

        if (data) {
            if (title) title.textContent = readOnly ? 'Booking Details' : 'Edit Booking';
            if (submitBtn) {
                submitBtn.textContent = 'Update Booking Record';
                submitBtn.style.display = readOnly ? 'none' : 'block';
            }

            form['bookingId'].value = data.bookingId || '';
            form['customerName'].value = data.customerName || currentUser.name;
            form['mobile'].value = data.mobileNumber || currentUser.phone || '';
            form['email'].value = data.email || currentUser.email;
            form['eventType'].value = data.eventType || data.service || data.name || '';
            form['eventDate'].value = data.eventDate || data.date || '';
            form['startTime'].value = data.startTime || '';
            form['endTime'].value = data.endTime || '';
            form['venueAddress'].value = data.venueAddress || '';

            inputs.forEach(input => {
                input.disabled = readOnly;
            });
        } else {
            if (title) title.textContent = 'Create New Booking';
            if (submitBtn) {
                submitBtn.textContent = 'Create Booking Record';
                submitBtn.style.display = 'block';
            }
            form.reset();
            form['customerName'].value = currentUser.name;
            form['mobile'].value = currentUser.phone || '';
            form['email'].value = currentUser.email;
            form['eventDate'].value = new Date().toISOString().split('T')[0];

            inputs.forEach(input => {
                input.disabled = false;
            });
        }

        modal.style.display = 'flex';
    };
    window.closeBookingForm = () => {
        document.getElementById('booking-modal').style.display = 'none';
    };

    // Handle form submission
    contentArea.addEventListener('submit', (e) => {
        if (e.target.id === 'new-booking-form') {
            e.preventDefault();
            const formData = new FormData(e.target);
            const bookingId = formData.get('bookingId');

            const bookingData = {
                name: formData.get('eventType'),
                service: formData.get('eventType'),
                eventType: formData.get('eventType'),
                icon: 'fa-calendar-check',
                customerName: formData.get('customerName'),
                mobileNumber: formData.get('mobile'),
                email: formData.get('email'),
                eventDate: formData.get('eventDate'),
                date: formData.get('eventDate'),
                startTime: formData.get('startTime'),
                endTime: formData.get('endTime'),
                venueAddress: formData.get('venueAddress'),
                status: 'Confirmed'
            };

            if (bookingId) {
                // Update existing
                const index = cartList.findIndex(b => b.bookingId === bookingId);
                if (index !== -1) {
                    cartList[index] = { ...cartList[index], ...bookingData };
                    alert('Booking updated successfully!');
                } else {
                    // If not in cart (e.g. from sample data), just add as new for demo
                    bookingData.bookingId = bookingId;
                    cartList.push(bookingData);
                    alert('Booking updated!');
                }
            } else {
                // Create new
                bookingData.bookingId = `BK-${Math.floor(1000 + Math.random() * 9000)}`;
                cartList.push(bookingData);
                alert('Booking created successfully!');
            }

            updateCartUI();
            closeBookingForm();

            // Re-render if we are on the bookings page
            const hash = window.location.hash.substring(1);
            if (hash === 'new-booking' || hash === 'approved-booking' || hash === 'cancelled-booking') {
                renderBookings(hash);
            }
        }
    });

    // --- Search Logic ---
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const hash = window.location.hash.substring(1) || 'dashboard';
            const query = e.target.value;
            if (hash === 'events') {
                contentArea.innerHTML = renderEvents(eventsList, query);
            } else if (hash === 'services') {
                contentArea.innerHTML = renderEvents(servicesList, query);
            } else if (query.length > 0) {
                window.location.hash = '#events';
            }
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const hash = window.location.hash.substring(1);
                if (hash !== 'events' && hash !== 'services') {
                    window.location.hash = '#events';
                }
                const list = (window.location.hash === '#services') ? servicesList : eventsList;
                contentArea.innerHTML = renderEvents(list, searchInput.value);
            }
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const hash = window.location.hash.substring(1);
            if (hash !== 'events' && hash !== 'services') {
                window.location.hash = '#events';
            }
            const list = (window.location.hash === '#services') ? servicesList : eventsList;
            contentArea.innerHTML = renderEvents(list, searchInput.value);
        });
    }

    function bindProfileEvents() {
        const form = document.getElementById('profile-form');
        const saveContainer = document.getElementById('save-btn-container');
        const successMsg = document.getElementById('profile-success-msg');
        const uploadInput = document.getElementById('profile-upload');
        const previewImg = document.getElementById('profile-preview');

        if (uploadInput && previewImg) {
            uploadInput.addEventListener('change', function () {
                if (this.files && this.files[0]) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        previewImg.src = e.target.result;
                        // Trigger save button
                        if (saveContainer) {
                            saveContainer.style.opacity = '1';
                            saveContainer.style.pointerEvents = 'auto';
                        }
                    }
                    reader.readAsDataURL(this.files[0]);
                }
            });
        }

        if (form) {
            // Show save button on input
            form.addEventListener('input', () => {
                saveContainer.style.opacity = '1';
                saveContainer.style.pointerEvents = 'auto';
            });

            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(form);

                // Update Local Data
                currentUser.name = formData.get('name');
                currentUser.phone = formData.get('phone');
                currentUser.email = formData.get('email');
                currentUser.city = formData.get('city');
                currentUser.address = formData.get('address');

                // Update Avatar based on new name
                currentUser.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=6366f1&color=fff`;

                const btn = document.getElementById('save-profile-btn');
                btn.innerText = 'Saving...';

                setTimeout(() => {
                    saveUser();
                    btn.innerText = 'Save Changes';
                    successMsg.style.display = 'block';
                    saveContainer.style.opacity = '0.5';
                    saveContainer.style.pointerEvents = 'none';

                    setTimeout(() => {
                        successMsg.style.display = 'none';
                    }, 3000);
                }, 800);
            });
        }
    }

    // --- Notification Logic ---
    function updateNotificationBadge() {
        const indicator = document.querySelector('.notification-indicator');
        const unreadItems = document.querySelectorAll('.dropdown-list li.unread');

        if (indicator) {
            if (unreadItems.length > 0) {
                indicator.style.display = 'block';
            } else {
                indicator.style.display = 'none';
            }
        }
    }

    const markReadBtn = document.getElementById('mark-read-btn');
    if (markReadBtn) {
        markReadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            // Remove unread class from items
            const unreadItems = document.querySelectorAll('.dropdown-list li.unread');
            unreadItems.forEach(item => item.classList.remove('unread'));
            updateNotificationBadge();
        });
    }

    // Individual notification click
    document.querySelectorAll('.dropdown-list li').forEach(item => {
        item.addEventListener('click', () => {
            item.classList.remove('unread');
            updateNotificationBadge();
        });
    });

    // Initial check
    updateNotificationBadge();
    updateSidebarUser();
    updateCartUI(); // Initial cart load



    // --- Initialization ---
    window.addEventListener('hashchange', handleNavigation);
    handleNavigation();

    // Magic Navigation Click Handler (optional but good for visual feedback)
    const magicList = document.querySelectorAll('.navigation li');
    magicList.forEach((item) => {
        item.addEventListener('click', function () {
            magicList.forEach(li => li.classList.remove('active'));
            this.classList.add('active');
        });
    });

});
