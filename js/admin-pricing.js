// 定价管理功能

// 显示新定价表单
function showNewPricingForm() {
    const form = document.getElementById('pricing-form');
    const formTitle = document.getElementById('pricing-form-title');
    
    // 设置表单标题
    formTitle.textContent = '添加新服务';
    
    // 重置表单
    document.getElementById('pricingForm').reset();
    document.getElementById('pricingId').value = '';
    
    // 显示表单
    form.style.display = 'block';
    
    // 滚动到表单位置
    form.scrollIntoView({ behavior: 'smooth' });
}

// 编辑定价
function editPricing(id) {
    const form = document.getElementById('pricing-form');
    const formTitle = document.getElementById('pricing-form-title');
    
    // 设置表单标题
    formTitle.textContent = '编辑服务';
    
    // 设置表单ID
    document.getElementById('pricingId').value = id;
    
    // 模拟获取数据（实际项目中应该从API获取）
    let data;
    if (id === '1') {
        data = {
            name: '基础旅游规划',
            description: '包含行程安排、景点推荐和交通建议',
            price: 299,
            status: 'online'
        };
    } else if (id === '2') {
        data = {
            name: '标准旅游规划',
            description: '包含行程安排、景点推荐、交通建议、餐饮推荐和住宿建议',
            price: 599,
            status: 'online'
        };
    } else {
        data = {
            name: '高级旅游规划',
            description: '包含行程安排、景点推荐、交通建议、餐饮推荐、住宿建议、当地向导联系和紧急支援',
            price: 999,
            status: 'online'
        };
    }
    
    // 填充表单
    document.getElementById('serviceName').value = data.name;
    document.getElementById('serviceDescription').value = data.description;
    document.getElementById('servicePrice').value = data.price;
    document.getElementById('serviceStatus').value = data.status;
    
    // 显示表单
    form.style.display = 'block';
    
    // 滚动到表单位置
    form.scrollIntoView({ behavior: 'smooth' });
}

// 删除定价
function deletePricing(id) {
    if (confirm('确定要删除这个服务吗？此操作无法撤销。')) {
        // 模拟删除操作（实际项目中应该调用API）
        alert('服务已删除');
        
        // 在实际项目中，这里应该重新加载数据
        // loadPricingData();
    }
}

// 取消编辑
function cancelPricingEdit() {
    document.getElementById('pricing-form').style.display = 'none';
}

// 处理定价表单提交
document.addEventListener('DOMContentLoaded', function() {
    const pricingForm = document.getElementById('pricingForm');
    if (pricingForm) {
        pricingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const pricingId = document.getElementById('pricingId').value;
            const serviceName = document.getElementById('serviceName').value;
            const servicePrice = document.getElementById('servicePrice').value;
            
            // 模拟保存操作（实际项目中应该调用API）
            alert(pricingId ? `服务 "${serviceName}" 已更新，价格: ¥${servicePrice}` : `新服务 "${serviceName}" 已创建，价格: ¥${servicePrice}`);
            
            // 隐藏表单
            document.getElementById('pricing-form').style.display = 'none';
            
            // 在实际项目中，这里应该重新加载数据
            // loadPricingData();
        });
    }
});

// 添加CSS样式
document.addEventListener('DOMContentLoaded', function() {
    // 为定价表格添加样式
    const style = document.createElement('style');
    style.textContent = `
        .pricing-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        
        .pricing-table th,
        .pricing-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e0e0e0;
        }
        
        .pricing-table th {
            background: #f5f5f5;
            font-weight: 600;
        }
        
        .pricing-table tr:hover {
            background: #f9f9f9;
        }
    `;
    document.head.appendChild(style);
});