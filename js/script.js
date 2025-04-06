// Order Form Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check which page we're on
    if (document.querySelector('#stickerOrderForm')) {
        initOrderForm();
    }
    if (document.querySelector('.payment-section')) {
        initPaymentPage();
    }
    
    // Initialize form steps
    function initOrderForm() {
        const formSteps = document.querySelectorAll('.form-step');
        const nextButtons = document.querySelectorAll('.next-btn');
        const prevButtons = document.querySelectorAll('.prev-btn');
        
        // Show first step initially
        showStep(0);
        
        // Next button click handlers
        nextButtons.forEach((button, index) => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const currentStep = document.querySelector('.form-step.active');
                const inputs = currentStep.querySelectorAll('input[required], textarea[required]');
                let isValid = true;
                
                // Validate required fields
                inputs.forEach(input => {
                    if (!input.value.trim()) {
                        input.style.borderColor = 'red';
                        isValid = false;
                    } else {
                        input.style.borderColor = '#ddd';
                    }
                });
                
                // Special validation for step 1 (logo upload)
                if (index === 0 && !document.getElementById('logoPreview').src.includes('#')) {
                    isValid = false;
                    alert('Please upload your logo before proceeding.');
                }
                
                if (isValid) {
                    // Calculate price when moving to step 2
                    if (index === 1) {
                        calculatePrice();
                    }
                    
                    // Save form data when moving to payment page
                    if (index === 2) {
                        saveFormData();
                    }
                    
                    showStep(index + 1);
                }
            });
        });
        
        // Previous button click handlers
        prevButtons.forEach((button, index) => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                showStep(index);
            });
        });
        
        // Quantity input change handler
        const quantityInput = document.getElementById('quantity');
        if (quantityInput) {
            quantityInput.addEventListener('change', calculatePrice);
        }
        
        // Logo upload functionality
        const uploadArea = document.getElementById('uploadArea');
        const logoUpload = document.getElementById('logoUpload');
        const logoPreview = document.getElementById('logoPreview');
        const previewContainer = document.getElementById('previewContainer');
        const changeLogoBtn = document.getElementById('changeLogo');
        
        uploadArea.addEventListener('click', () => logoUpload.click());
        
        logoUpload.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                const reader = new FileReader();
                
                reader.onload = function(event) {
                    logoPreview.src = event.target.result;
                    uploadArea.style.display = 'none';
                    previewContainer.style.display = 'block';
                };
                
                reader.readAsDataURL(file);
            }
        });
        
        changeLogoBtn.addEventListener('click', function() {
            logoUpload.value = '';
            uploadArea.style.display = 'block';
            previewContainer.style.display = 'none';
        });
        
        // Drag and drop for logo upload
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--primary-color)';
            uploadArea.style.backgroundColor = 'rgba(74, 107, 255, 0.1)';
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = '#ddd';
            uploadArea.style.backgroundColor = 'transparent';
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '#ddd';
            uploadArea.style.backgroundColor = 'transparent';
            
            if (e.dataTransfer.files.length > 0) {
                logoUpload.files = e.dataTransfer.files;
                const event = new Event('change');
                logoUpload.dispatchEvent(event);
            }
        });
    }
    
    // Show specific step in the form
    function showStep(stepIndex) {
        const steps = document.querySelectorAll('.form-step');
        steps.forEach((step, index) => {
            if (index === stepIndex) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    }
    
    // Calculate total price based on quantity
    function calculatePrice() {
        const quantity = parseInt(document.getElementById('quantity').value) || 5;
        const pricePerSheet = 90;
        const deliveryCharge = 80;
        
        const subtotal = quantity * pricePerSheet;
        const total = subtotal + deliveryCharge;
        
        document.getElementById('totalPrice').textContent = total;
    }
    
    // Save form data to localStorage for payment page
    function saveFormData() {
        const formData = {
            logo: document.getElementById('logoPreview').src,
            quantity: document.getElementById('quantity').value,
            name: document.getElementById('name').value,
            address: document.getElementById('address').value,
            pincode: document.getElementById('pincode').value,
            city: document.getElementById('city').value,
            state: document.getElementById('state').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value
        };
        
        localStorage.setItem('logoWaleBhaiyaOrder', JSON.stringify(formData));
    }
    
    // Initialize payment page
    function initPaymentPage() {
        // Load order data from localStorage
        const orderData = JSON.parse(localStorage.getItem('logoWaleBhaiyaOrder'));
        
        if (orderData) {
            // Display order summary
            document.getElementById('paymentLogoPreview').src = orderData.logo;
            document.getElementById('summarySheets').textContent = orderData.quantity;
            document.getElementById('summaryStickers').textContent = parseInt(orderData.quantity) * 96;
            document.getElementById('summaryPrice').textContent = parseInt(orderData.quantity) * 90;
            document.getElementById('summaryTotal').textContent = (parseInt(orderData.quantity) * 90) + 80;
            
            // Display customer info
            document.getElementById('summaryName').textContent = orderData.name;
            document.getElementById('summaryAddress').textContent = orderData.address;
            document.getElementById('summaryCityPincode').textContent = `${orderData.city} - ${orderData.pincode}`;
            document.getElementById('summaryState').textContent = orderData.state;
            document.getElementById('summaryPhone').textContent = `Phone: ${orderData.phone}`;
        }
        
        // Payment proof upload functionality
        const paymentUploadArea = document.getElementById('paymentUploadArea');
        const paymentProof = document.getElementById('paymentProof');
        const paymentProofPreview = document.getElementById('paymentProofPreview');
        const paymentPreviewContainer = document.getElementById('paymentPreviewContainer');
        const changePaymentProofBtn = document.getElementById('changePaymentProof');
        
        paymentUploadArea.addEventListener('click', () => paymentProof.click());
        
        paymentProof.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                const reader = new FileReader();
                
                reader.onload = function(event) {
                    paymentProofPreview.src = event.target.result;
                    paymentUploadArea.style.display = 'none';
                    paymentPreviewContainer.style.display = 'block';
                };
                
                reader.readAsDataURL(file);
            }
        });
        
        changePaymentProofBtn.addEventListener('click', function() {
            paymentProof.value = '';
            paymentUploadArea.style.display = 'block';
            paymentPreviewContainer.style.display = 'none';
        });
        
        // Confirm order button
        const confirmOrderBtn = document.getElementById('confirmOrder');
        if (confirmOrderBtn) {
            confirmOrderBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                if (!document.getElementById('paymentProofPreview').src.includes('#')) {
                    // Generate random order ID
                    const orderId = Math.floor(10000 + Math.random() * 90000);
                    document.getElementById('orderId').textContent = orderId;
                    
                    // Show success modal
                    document.getElementById('successModal').style.display = 'flex';
                    
                    // Clear localStorage
                    localStorage.removeItem('logoWaleBhaiyaOrder');
                } else {
                    alert('Please upload your payment proof before confirming the order.');
                }
            });
        }
        
        // Close modal
        const closeModal = document.querySelector('.close-modal');
        if (closeModal) {
            closeModal.addEventListener('click', function() {
                document.getElementById('successModal').style.display = 'none';
            });
        }
    }
    
    // Copy UPI ID to clipboard
    window.copyUpiId = function(upiId) {
        navigator.clipboard.writeText(upiId).then(() => {
            alert(`UPI ID "${upiId}" copied to clipboard!`);
        }).catch(err => {
            console.error('Failed to copy UPI ID: ', err);
        });
    };
});

// Save order to database
async function saveOrderToDatabase(orderData) {
    try {
        const response = await fetch('api/process_order.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error saving order:', error);
        return { success: false, message: 'Failed to save order' };
    }
}

// Update order review section
function updateOrderReview() {
    const quantity = parseInt(document.getElementById('quantity').value) || 5;
    const pricePerSheet = 90;
    const deliveryCharge = 80;
    const subtotal = quantity * pricePerSheet;
    const total = subtotal + deliveryCharge;
    
    document.getElementById('reviewSheets').textContent = quantity;
    document.getElementById('reviewStickers').textContent = quantity * 96;
    document.getElementById('reviewPrice').textContent = subtotal;
    document.getElementById('reviewTotal').textContent = total;
    
    // Also update the hidden fields for payment page
    document.getElementById('summarySheets').textContent = quantity;
    document.getElementById('summaryStickers').textContent = quantity * 96;
    document.getElementById('summaryPrice').textContent = subtotal;
    document.getElementById('summaryTotal').textContent = total;
}

// Enhanced saveFormData function
function saveFormData() {
    const logoPreview = document.getElementById('logoPreview');
    let logoBase64 = '';
    
    if (logoPreview.src && !logoPreview.src.includes('#')) {
        logoBase64 = logoPreview.src;
    }
    
    const formData = {
        logo_base64: logoBase64,
        quantity: document.getElementById('quantity').value,
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        house_number: document.getElementById('house_number').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        pincode: document.getElementById('pincode').value,
        state: document.getElementById('state').value,
        email: document.getElementById('email').value
    };
    
    localStorage.setItem('logoWaleBhaiyaOrder', JSON.stringify(formData));
    updateOrderReview();
}

// Enhanced confirm order functionality
async function confirmOrder() {
    const orderData = JSON.parse(localStorage.getItem('logoWaleBhaiyaOrder'));
    const paymentProofPreview = document.getElementById('paymentProofPreview');
    
    if (!paymentProofPreview.src.includes('#')) {
        // Add payment proof to order data
        orderData.payment_proof_url = paymentProofPreview.src;
        
        // Save order to database
        const result = await saveOrderToDatabase(orderData);
        
        if (result.success) {
            // Show success modal with order ID
            document.getElementById('orderId').textContent = result.order_id;
            document.getElementById('successModal').style.display = 'flex';
            
            // Clear localStorage
            localStorage.removeItem('logoWaleBhaiyaOrder');
        } else {
            alert('Failed to save order: ' + result.message);
        }
    } else {
        alert('Please upload your payment proof before confirming the order.');
    }
}

// Add this to your DOMContentLoaded event listener
document.getElementById('quantity').addEventListener('input', updateOrderReview);
document.getElementById('confirmOrder').addEventListener('click', confirmOrder);