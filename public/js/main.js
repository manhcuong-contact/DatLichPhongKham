/**
 * public/js/main.js
 * Common UI logic
 */

document.addEventListener('DOMContentLoaded', () => {
    renderNavbar();
});

function renderNavbar() {
    const user = api.getUser();
    const navRight = document.getElementById('nav-right');
    
    if (!navRight) return;

    if (user) {
        let dashboardUrl = '/patient/dashboard.html';
        if (user.roleName === 'admin') dashboardUrl = '/admin/dashboard.html';
        else if (user.roleName === 'doctor') dashboardUrl = '/doctor/dashboard.html';

        navRight.innerHTML = `
            <div class="dropdown">
                <button class="btn btn-light rounded-circle p-0" type="button" data-bs-toggle="dropdown" aria-expanded="false" style="width:40px;height:40px;overflow:hidden;border:2px solid var(--primary-color);">
                    <img src="${user.avatarUrl ? '/uploads/' + user.avatarUrl : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.fullName)}" class="w-100 h-100 object-fit-cover">
                </button>
                <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0 mt-2" style="border-radius: 1rem;">
                    <li><h6 class="dropdown-header fw-bold">${user.fullName}</h6></li>
                    <li><a class="dropdown-item" href="${dashboardUrl}"><i class="bi bi-speedometer2 me-2"></i> Bảng điều khiển</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item text-danger" href="#" onclick="logout()"><i class="bi bi-box-arrow-right me-2"></i> Đăng xuất</a></li>
                </ul>
            </div>
        `;
    } else {
        navRight.innerHTML = `
            <a href="/login.html" class="btn btn-outline-primary rounded-pill px-4 me-2">Đăng nhập</a>
            <a href="/register.html" class="btn btn-primary-gradient">Đăng ký</a>
        `;
    }
}

async function logout() {
    try {
        await api.post('/auth/logout', {});
    } catch (e) {
        console.error(e);
    } finally {
        api.clearToken();
        window.location.href = '/';
    }
}
