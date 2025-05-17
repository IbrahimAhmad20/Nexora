function filterVendors(query) {
    query = query.trim().toLowerCase();
    if (!query) {
        renderVendorTable(window._vendors || []);
        return;
    }
    const filtered = (window._vendors || []).filter(vendor =>
        (vendor.email && vendor.email.toLowerCase().includes(query)) ||
        (vendor.first_name && vendor.first_name.toLowerCase().includes(query)) ||
        (vendor.last_name && vendor.last_name.toLowerCase().includes(query)) ||
        (vendor.business_name && vendor.business_name.toLowerCase().includes(query))
    );
    renderVendorTable(filtered);
}

window.openAddVendorModal = function() {
    document.getElementById('addVendorForm').reset();
    document.getElementById('addVendorModal').style.display = 'block';
};
window.closeAddVendorModal = function() {
    document.getElementById('addVendorModal').style.display = 'none';
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('[admin-vendors] DOMContentLoaded');
    loadVendors();
    document.getElementById('editVendorForm').onsubmit = async function(e) {
        e.preventDefault();
        const vendorId = document.getElementById('editVendorId').value;
        const businessName = document.getElementById('editBusinessName').value;
        const status = document.getElementById('editStatus').value;
        try {
            // Update vendor status and business name
            await api.updateVendorStatus(vendorId, status, businessName);
            closeEditVendorModal();
            loadVendors();
        } catch (err) {
            alert('Failed to update vendor');
        }
    };
    document.querySelector('.add-vendor-btn').onclick = openAddVendorModal;
    document.getElementById('addVendorForm').onsubmit = async function(e) {
        e.preventDefault();
        console.log('Submitting add vendor form');
        const email = document.getElementById('addVendorEmail').value;
        const first_name = document.getElementById('addVendorFirstName').value;
        const last_name = document.getElementById('addVendorLastName').value;
        const business_name = document.getElementById('addVendorBusinessName').value;
        const password = document.getElementById('addVendorPassword').value;
        try {
            const res = await api.addVendor({ email, first_name, last_name, business_name, password });
            console.log('[admin-vendors] Add vendor API response:', res);
            closeAddVendorModal();
            loadVendors();
        } catch (err) {
            console.error('[admin-vendors] Failed to add vendor:', err);
            alert('Failed to add vendor: ' + (err.message || 'Unknown error'));
        }
    };
    document.querySelectorAll('.vendor-search').forEach(input => {
        input.addEventListener('input', function() {
            console.log('Vendor search input:', this.value);
            filterVendors(this.value);
        });
    });
});

async function loadVendors() {
    try {
        console.log('[admin-vendors] loadVendors called');
        const res = await api.getAllVendors();
        console.log('[admin-vendors] API response:', res);
        const vendors = res.vendors || res.data;
        renderVendorTable(vendors);
        window._vendors = vendors;
    } catch (err) {
        console.error('[admin-vendors] Failed to load vendors:', err);
        alert('Failed to load vendors');
    }
}

function renderVendorTable(vendors) {
    const tbody = document.getElementById('vendorTableBody');
    tbody.innerHTML = '';
    vendors.forEach(vendor => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${vendor.id}</td>
            <td>${vendor.email}</td>
            <td>${vendor.first_name || ''} ${vendor.last_name || ''}</td>
            <td>${vendor.business_name || ''}</td>
            <td>${vendor.status || ''}</td>
            <td>${new Date(vendor.created_at).toLocaleDateString()}</td>
            <td>
                <button class="action-btn edit-btn" data-vendor-id="${vendor.id}">Edit</button>
                <button class="action-btn delete" onclick="deleteVendor(${vendor.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.deleteVendor = async function(vendorId) {
    if (!confirm('Are you sure you want to delete this vendor?')) return;
    try {
        console.log('[admin-vendors] Deleting vendor:', vendorId);
        await api.deleteVendor(vendorId);
        loadVendors();
    } catch (err) {
        console.error('[admin-vendors] Failed to delete vendor:', err);
        alert('Failed to delete vendor');
    }
};

window.showEditVendorModal = function(vendor) {
    // Populate modal fields
    document.getElementById('editVendorId').value = vendor.id;
    document.getElementById('editBusinessName').value = vendor.business_name || '';
    document.getElementById('editStatus').value = vendor.status || 'pending';
    document.getElementById('editVendorModal').style.display = 'block';
};

window.closeEditVendorModal = function() {
    document.getElementById('editVendorModal').style.display = 'none';
};

document.addEventListener('click', function(e) {
    if (e.target.classList.contains('edit-btn')) {
        const vendorId = e.target.getAttribute('data-vendor-id');
        const vendor = window._vendors.find(v => v.id == vendorId);
        if (vendor) showEditVendorModal(vendor);
    }
}); 