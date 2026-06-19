const API = '/api';
let currentSession = localStorage.getItem('chatSession') || crypto.randomUUID();
localStorage.setItem('chatSession', currentSession);

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
  document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`nav button[data-page="${pageId}"]`);
  if (btn) btn.classList.add('active');
  if (pageId === 'dashboard') loadDashboard();
  if (pageId === 'orders') loadOrders();
  if (pageId === 'invoices') loadInvoices();
  if (pageId === 'dispatches') loadDispatches();
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Error del servidor');
  return data.data;
}

function toast(msg, type = 'success') {
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// ============================================
// DASHBOARD
// ============================================
let charts = {};

function destroyCharts() {
  Object.values(charts).forEach(c => { if (c) { c.destroy(); } });
  charts = {};
}

const CHART_ANIMATION = {
  duration: 1000,
  easing: 'easeOutQuart',
  animateRotate: true,
  animateScale: true,
};

function createDonutChart(id, labels, data, colors) {
  const ctx = document.getElementById(id);
  if (!ctx) return null;
  return new Chart(ctx, {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 2, borderColor: '#fff' }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      animation: CHART_ANIMATION,
      plugins: {
        legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true, font: { size: 11 } } },
        tooltip: {
          backgroundColor: 'rgba(0,0,0,0.85)',
          padding: 12,
          cornerRadius: 8,
          callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed}` },
        },
      },
      cutout: '68%',
      hoverOffset: 8,
    },
  });
}

function createBarChart(id, labels, data, color) {
  const ctx = document.getElementById(id);
  if (!ctx) return null;
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Pedidos', data,
        backgroundColor: color,
        borderRadius: 6, borderSkipped: false,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      animation: { ...CHART_ANIMATION, duration: 800 },
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 10 } }, grid: { color: 'rgba(0,0,0,0.06)' } },
        x: { ticks: { font: { size: 10 } }, grid: { display: false } },
      },
    },
  });
}

async function loadDashboard() {
  try {
    const [orderStats, invoiceStats, dispatchStats, orders] = await Promise.all([
      apiFetch('/orders/stats'), apiFetch('/invoices/stats'), apiFetch('/dispatches/stats'),
      apiFetch('/orders'),
    ]);

    document.getElementById('total-orders').textContent = orderStats.total;
    document.getElementById('pending-orders').textContent = orderStats.pendiente;
    document.getElementById('total-invoices').textContent = invoiceStats.total;
    document.getElementById('total-dispatches').textContent = dispatchStats.total;
    document.getElementById('delivered').textContent = dispatchStats.entregado;
    document.getElementById('revenue').textContent = `$${invoiceStats.totalFacturado.toLocaleString()}`;

    document.getElementById('flow-pendiente').classList.add('active');
    document.getElementById('flow-confirmado').classList.add('done');
    document.getElementById('flow-facturado').classList.add('done');
    document.getElementById('flow-despachado').classList.add('done');
    document.getElementById('flow-entregado').classList.add('done');

    destroyCharts();

    charts.ordersStatus = createDonutChart('chart-orders-status',
      ['Pendientes', 'Facturados', 'Despachados', 'Entregados', 'Cancelados'],
      [orderStats.pendiente, orderStats.facturado, orderStats.despachado, orderStats.entregado, orderStats.cancelado],
      ['#f59e0b', '#3b82f6', '#7c3aed', '#10b981', '#ef4444'],
    );

    charts.invoicesStatus = createDonutChart('chart-invoices-status',
      ['Emitidas', 'Pagadas', 'Canceladas'],
      [invoiceStats.emitidas || 0, invoiceStats.pagadas || 0, invoiceStats.canceladas || 0],
      ['#3b82f6', '#10b981', '#ef4444'],
    );

    charts.dispatchesStatus = createDonutChart('chart-dispatches-status',
      ['Preparando', 'En Tránsito', 'Entregados', 'Fallidos'],
      [dispatchStats.preparando || 0, dispatchStats.enTransito || 0, dispatchStats.entregado || 0, dispatchStats.fallido || 0],
      ['#f59e0b', '#3b82f6', '#10b981', '#ef4444'],
    );

    const dateMap = {};
    orders.forEach(o => {
      const d = new Date(o.createdAt);
      const key = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!dateMap[key]) dateMap[key] = { count: 0, revenue: 0 };
      dateMap[key].count += 1;
      dateMap[key].revenue += o.total;
    });
    const sortedDates = Object.keys(dateMap).sort((a, b) => {
      const [da, ma] = a.split('/').map(Number);
      const [db, mb] = b.split('/').map(Number);
      return da + ma * 31 - (db + mb * 31);
    });

    charts.ordersTrend = createBarChart('chart-orders-trend',
      sortedDates, sortedDates.map(k => dateMap[k].count),
      'rgba(99, 102, 241, 0.7)',
    );

    const revCtx = document.getElementById('chart-revenue');
    if (revCtx) {
      charts.revenue = new Chart(revCtx, {
        type: 'line',
        data: {
          labels: sortedDates,
          datasets: [{
            label: 'Ingresos ($)',
            data: sortedDates.map(k => dateMap[k].revenue),
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#10b981',
            pointHoverRadius: 7,
            pointHoverBackgroundColor: '#059669',
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          animation: { ...CHART_ANIMATION, duration: 1200 },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(0,0,0,0.85)',
              padding: 12,
              cornerRadius: 8,
              callbacks: {
                label: ctx => ` $${ctx.parsed.y.toLocaleString()}`,
              },
            },
          },
          scales: {
            y: { beginAtZero: true, ticks: { callback: v => '$' + v.toLocaleString(), font: { size: 10 } }, grid: { color: 'rgba(0,0,0,0.06)' } },
            x: { ticks: { font: { size: 10 } }, grid: { display: false } },
          },
          interaction: { intersect: false, mode: 'index' },
        },
      });
    }
  } catch (e) { toast(e.message, 'error'); }
}

// ============================================
// ORDERS
// ============================================
async function loadOrders() {
  const tbody = document.querySelector('#orders-table tbody');
  tbody.innerHTML = '<tr><td colspan="7" class="loading">Cargando...</td></tr>';
  try {
    const orders = await apiFetch('/orders');
    if (orders.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state">No hay pedidos aun. Crea uno o simula uno de prueba.</div></td></tr>';
      return;
    }
    tbody.innerHTML = orders.map(o => `
      <tr>
        <td>${o.id.slice(0, 8)}...</td>
        <td>${o.clientName}</td>
        <td>$${o.total.toLocaleString()}</td>
        <td><span class="status-badge status-${o.status}">${o.status.replace(/_/g, ' ')}</span></td>
        <td>${o.paymentMethod}</td>
        <td>${new Date(o.createdAt).toLocaleDateString()}</td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="advanceOrder('${o.id}')">Avanzar</button>
          ${o.status !== 'entregado' && o.status !== 'despachado' && o.status !== 'cancelado' ? `<button class="btn btn-sm btn-danger" onclick="cancelOrder('${o.id}')">X</button>` : ''}
          <button class="btn btn-sm btn-outline" onclick="viewOrder('${o.id}')">Ver</button>
        </td>
      </tr>
    `).join('');
  } catch (e) { tbody.innerHTML = `<tr><td colspan="7">Error: ${e.message}</td></tr>`; }
}

async function advanceOrder(id) {
  try {
    const result = await apiFetch(`/orders/${id}/advance`, { method: 'PATCH' });
    let msg = `Pedido avanzado a: ${result.order.status}`;
    if (result.autoProcessed?.invoice) msg += ' | Factura generada automáticamente';
    if (result.autoProcessed?.dispatch) msg += ' | Despacho generado automáticamente';
    toast(msg);
    loadOrders();
  } catch (e) { toast(e.message, 'error'); }
}

async function cancelOrder(id) {
  if (!confirm('¿Cancelar este pedido?')) return;
  try {
    await apiFetch(`/orders/${id}/cancel`, { method: 'PATCH' });
    toast('Pedido cancelado');
    loadOrders();
  } catch (e) { toast(e.message, 'error'); }
}

async function viewOrder(id) {
  try {
    const order = await apiFetch(`/orders/${id}`);
    const invoice = await apiFetch(`/invoices/order/${id}`).catch(() => null);
    const dispatch = await apiFetch(`/dispatches/order/${id}`).catch(() => null);
    document.getElementById('modal-body').innerHTML = `
      <h2>Pedido ${order.id.slice(0, 8)}</h2>
      <p><strong>Cliente:</strong> ${order.clientName} (${order.clientEmail})</p>
      <p><strong>Teléfono:</strong> ${order.clientPhone}</p>
      <p><strong>Estado:</strong> <span class="status-badge status-${order.status}">${order.status}</span></p>
      <p><strong>Método de pago:</strong> ${order.paymentMethod}</p>
      <p><strong>Total:</strong> $${order.total.toLocaleString()}</p>
      <p><strong>Notas:</strong> ${order.notes || 'N/A'}</p>
      <p><strong>Creado:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
      <hr style="margin:1rem 0">
      <h3>Productos</h3>
      <table><thead><tr><th>Producto</th><th>Cant</th><th>Precio</th><th>Subtotal</th></tr></thead><tbody>
        ${order.items.map(i => `<tr><td>${i.productName}</td><td>${i.quantity}</td><td>$${i.unitPrice}</td><td>$${i.subtotal}</td></tr>`).join('')}
      </tbody></table>
      ${invoice ? `<hr style="margin:1rem 0"><h3>Factura: ${invoice.invoiceNumber}</h3><p>Estado: ${invoice.status} | Total: $${invoice.total.toLocaleString()}</p>` : ''}
      ${dispatch ? `<hr style="margin:1rem 0"><h3>Despacho: ${dispatch.trackingNumber}</h3><p>Estado: ${dispatch.status} | Paquetería: ${dispatch.carrier}</p>` : ''}
    `;
    document.getElementById('modal').style.display = 'flex';
  } catch (e) { toast(e.message, 'error'); }
}

document.getElementById('create-order-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const items = [];
  const products = document.querySelectorAll('.order-item');
  products.forEach(p => {
    items.push({
      productId: p.querySelector('[name="productId"]').value,
      productName: p.querySelector('[name="productName"]').value,
      quantity: parseInt(p.querySelector('[name="quantity"]').value),
      unitPrice: parseFloat(p.querySelector('[name="unitPrice"]').value),
    });
  });
  try {
    await apiFetch('/orders', {
      method: 'POST',
      body: JSON.stringify({
        clientName: fd.get('clientName'),
        clientEmail: fd.get('clientEmail'),
        clientPhone: fd.get('clientPhone'),
        paymentMethod: fd.get('paymentMethod'),
        notes: fd.get('notes'),
        items,
      }),
    });
    toast('Pedido creado exitosamente');
    e.target.reset();
    document.querySelector('.order-items').innerHTML = '';
    addOrderItem();
    loadOrders();
  } catch (err) { toast(err.message, 'error'); }
});

let itemCount = 0;
function addOrderItem() {
  itemCount++;
  const div = document.createElement('div');
  div.className = 'form-row order-item';
  div.innerHTML = `
    <input type="hidden" name="productId" value="PROD-${String(itemCount).padStart(3, '0')}">
    <div class="form-group"><label>Producto</label><input type="text" name="productName" placeholder="Nombre del producto" required></div>
    <div class="form-group"><label>Cantidad</label><input type="number" name="quantity" min="1" value="1" required></div>
    <div class="form-group"><label>Precio unitario ($)</label><input type="number" name="unitPrice" min="0.01" step="0.01" required></div>
    <div style="display:flex;align-items:end;padding-bottom:1rem"><button type="button" class="btn btn-sm btn-danger" onclick="this.parentElement.parentElement.remove()">X</button></div>
  `;
  document.querySelector('.order-items').appendChild(div);
}

async function simulateOrder() {
  try {
    const order = await apiFetch('/orders/simulate', { method: 'POST' });
    toast(`Pedido simulado creado: $${order.total.toLocaleString()}`);
    loadOrders();
  } catch (e) { toast(e.message, 'error'); }
}

// ============================================
// INVOICES
// ============================================
async function loadInvoices() {
  const tbody = document.querySelector('#invoices-table tbody');
  tbody.innerHTML = '<tr><td colspan="6" class="loading">Cargando...</td></tr>';
  try {
    const invoices = await apiFetch('/invoices');
    if (invoices.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state">No hay facturas. Avanza un pedido a "facturado" para generar una automaticamente.</div></td></tr>';
      return;
    }
    tbody.innerHTML = invoices.map(i => `
      <tr>
        <td>${i.invoiceNumber}</td>
        <td>${i.clientName}</td>
        <td>$${i.subtotal.toLocaleString()}</td>
        <td>$${i.tax.toLocaleString()}</td>
        <td>$${i.total.toLocaleString()}</td>
        <td><span class="status-badge status-${i.status}">${i.status}</span></td>
        <td>
          ${i.status === 'emitida' ? `<button class="btn btn-sm btn-success" onclick="payInvoice('${i.id}')">Pagar</button>` : ''}
          <button class="btn btn-sm btn-outline" onclick="viewInvoice('${i.id}')">Ver</button>
        </td>
      </tr>
    `).join('');
  } catch (e) { tbody.innerHTML = `<tr><td colspan="6">Error: ${e.message}</td></tr>`; }
}

async function payInvoice(id) {
  try {
    await apiFetch(`/invoices/${id}/pay`, { method: 'PATCH' });
    toast('Factura pagada');
    loadInvoices();
  } catch (e) { toast(e.message, 'error'); }
}

async function viewInvoice(id) {
  try {
    const inv = await apiFetch(`/invoices/${id}`);
    const order = await apiFetch(`/orders/${inv.orderId}`).catch(() => null);
    document.getElementById('modal-body').innerHTML = `
      <h2>Factura ${inv.invoiceNumber}</h2>
      <p><strong>Cliente:</strong> ${inv.clientName} (${inv.clientEmail})</p>
      <p><strong>Estado:</strong> <span class="status-badge status-${inv.status}">${inv.status}</span></p>
      <p><strong>Pedido:</strong> ${inv.orderId.slice(0, 8)}... ${order ? `(${order.clientName})` : ''}</p>
      <hr style="margin:1rem 0">
      <table><thead><tr><th>Producto</th><th>Cant</th><th>Precio</th><th>Subtotal</th></tr></thead><tbody>
        ${inv.items.map(i => `<tr><td>${i.productName}</td><td>${i.quantity}</td><td>$${i.unitPrice}</td><td>$${i.subtotal}</td></tr>`).join('')}
      </tbody></table>
      <hr style="margin:1rem 0">
      <p><strong>Subtotal:</strong> $${inv.subtotal.toLocaleString()}</p>
      <p><strong>IVA (16%):</strong> $${inv.tax.toLocaleString()}</p>
      <p><strong style="font-size:1.1rem">Total:</strong> <strong style="font-size:1.1rem">$${inv.total.toLocaleString()}</strong></p>
      <p><small>Emitida: ${new Date(inv.issuedAt).toLocaleString()} ${inv.paidAt ? `| Pagada: ${new Date(inv.paidAt).toLocaleString()}` : ''}</small></p>
    `;
    document.getElementById('modal').style.display = 'flex';
  } catch (e) { toast(e.message, 'error'); }
}

// ============================================
// DISPATCHES
// ============================================
async function loadDispatches() {
  const tbody = document.querySelector('#dispatches-table tbody');
  tbody.innerHTML = '<tr><td colspan="6" class="loading">Cargando...</td></tr>';
  try {
    const dispatches = await apiFetch('/dispatches');
    if (dispatches.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state">No hay despachos. Avanza un pedido a "despachado" para generar uno automaticamente.</div></td></tr>';
      return;
    }
    tbody.innerHTML = dispatches.map(d => `
      <tr>
        <td>${d.trackingNumber}</td>
        <td>${d.clientName}</td>
        <td>${d.carrier}</td>
        <td><span class="status-badge status-${d.status}">${d.status.replace(/_/g, ' ')}</span></td>
        <td>${new Date(d.dispatchedAt).toLocaleDateString()}</td>
        <td>
          ${d.status === 'preparando' ? `<button class="btn btn-sm btn-primary" onclick="advanceDispatch('${d.id}')">Enviar</button>` : ''}
          ${d.status === 'en_transito' ? `<button class="btn btn-sm btn-success" onclick="deliverDispatch('${d.id}')">Entregar</button>` : ''}
          ${d.status !== 'entregado' && d.status !== 'fallido' ? `<button class="btn btn-sm btn-danger" onclick="failDispatch('${d.id}')">Fallido</button>` : ''}
          <button class="btn btn-sm btn-outline" onclick="viewDispatch('${d.id}')">Ver</button>
        </td>
      </tr>
    `).join('');
  } catch (e) { tbody.innerHTML = `<tr><td colspan="6">Error: ${e.message}</td></tr>`; }
}

async function advanceDispatch(id) {
  try {
    await apiFetch(`/dispatches/${id}/advance`, { method: 'PATCH' });
    toast('Despacho actualizado');
    loadDispatches();
  } catch (e) { toast(e.message, 'error'); }
}

async function deliverDispatch(id) {
  try {
    await apiFetch(`/dispatches/${id}/advance`, { method: 'PATCH' });
    toast('Despacho entregado');
    loadDispatches();
  } catch (e) { toast(e.message, 'error'); }
}

async function failDispatch(id) {
  try {
    await apiFetch(`/dispatches/${id}/fail`, { method: 'PATCH' });
    toast('Despacho marcado como fallido');
    loadDispatches();
  } catch (e) { toast(e.message, 'error'); }
}

async function viewDispatch(id) {
  try {
    const d = await apiFetch(`/dispatches/${id}`);
    const order = await apiFetch(`/orders/${d.orderId}`).catch(() => null);
    document.getElementById('modal-body').innerHTML = `
      <h2>Despacho ${d.trackingNumber}</h2>
      <p><strong>Cliente:</strong> ${d.clientName}</p>
      <p><strong>Paquetería:</strong> ${d.carrier}</p>
      <p><strong>Dirección:</strong> ${d.address}</p>
      <p><strong>Estado:</strong> <span class="status-badge status-${d.status}">${d.status.replace(/_/g, ' ')}</span></p>
      <p><strong>Pedido:</strong> ${d.orderId.slice(0, 8)}... ${order ? `(${order.clientName})` : ''}</p>
      <p><strong>Despachado:</strong> ${new Date(d.dispatchedAt).toLocaleString()}</p>
      ${d.deliveredAt ? `<p><strong>Entregado:</strong> ${new Date(d.deliveredAt).toLocaleString()}</p>` : ''}
      <hr style="margin:1rem 0">
      <h3>Productos</h3>
      <table><thead><tr><th>Producto</th><th>Cant</th></tr></thead><tbody>
        ${d.items.map(i => `<tr><td>${i.productName}</td><td>${i.quantity}</td></tr>`).join('')}
      </tbody></table>
    `;
    document.getElementById('modal').style.display = 'flex';
  } catch (e) { toast(e.message, 'error'); }
}

// ============================================
// CHATBOT
// ============================================
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const chatSend = document.getElementById('chat-send');
const suggestionsDiv = document.getElementById('suggestions');

function addChatMessage(role, content) {
  const div = document.createElement('div');
  div.className = `chat-msg ${role}`;
  div.innerHTML = content.replace(/\n/g, '<br>') + `<span class="time">${new Date().toLocaleTimeString()}</span>`;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTyping() {
  const div = document.createElement('div');
  div.className = 'typing';
  div.id = 'typing-indicator';
  div.innerHTML = '<span></span><span></span><span></span>';
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTyping() {
  const el = document.getElementById('typing-indicator');
  if (el) el.remove();
}

function setSuggestions(suggestions) {
  suggestionsDiv.innerHTML = suggestions.map(s => `<button onclick="sendChat('${s}')">${s}</button>`).join('');
}

async function sendChat(msg) {
  const message = msg || chatInput.value.trim();
  if (!message) return;
  chatInput.value = '';
  addChatMessage('user', message);
  showTyping();
  try {
    const data = await apiFetch('/chat/message', {
      method: 'POST',
      body: JSON.stringify({ message, sessionId: currentSession }),
    });
    hideTyping();
    addChatMessage('assistant', data.reply);
    setSuggestions(data.suggestions);
  } catch (e) {
    hideTyping();
    addChatMessage('assistant', `Error: ${e.message}`);
  }
}

chatSend.addEventListener('click', () => sendChat());
chatInput.addEventListener('keypress', e => { if (e.key === 'Enter') sendChat(); });

// ============================================
// MODAL
// ============================================
document.getElementById('modal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('modal')) {
    document.getElementById('modal').style.display = 'none';
  }
});

// ============================================
// INIT
// ============================================
addOrderItem();
showPage('dashboard');
