/**
 * Portafolio AGM 2026 - Lógica Interactiva
 * - Visor de PDF a ancho completo (sin recortes laterales)
 * - Lector Modal a Pantalla Completa para cualquier documento
 * - Buscador en tiempo real de publicaciones e informes
 * - Filtros por área temática e institución
 */

document.addEventListener('DOMContentLoaded', function () {
  // 1. Visor de PDF integrado a ancho completo
  const pdfSelectDropdown = document.getElementById('pdfSelectDropdown');
  const pdfViewerFrame = document.getElementById('pdfViewerFrame');
  const pdfOpenBtn = document.getElementById('pdfOpenBtn');
  const pdfDownloadBtn = document.getElementById('pdfDownloadBtn');
  const pdfModalBtn = document.getElementById('pdfModalBtn');

  // 2. Modal Lector a Pantalla Completa
  const pdfModal = document.getElementById('pdfModal');
  const pdfModalFrame = document.getElementById('pdfModalFrame');
  const pdfModalTitle = document.getElementById('pdfModalTitle');
  const pdfModalOpenBtn = document.getElementById('pdfModalOpenBtn');
  const pdfModalDownloadBtn = document.getElementById('pdfModalDownloadBtn');
  const pdfModalCloseBtn = document.getElementById('pdfModalCloseBtn');

  function openPdfInModal(pdfUrl, title) {
    if (!pdfModal) return;
    if (pdfModalFrame) pdfModalFrame.src = pdfUrl;
    if (pdfModalTitle) pdfModalTitle.textContent = title;
    if (pdfModalOpenBtn) pdfModalOpenBtn.href = pdfUrl;
    if (pdfModalDownloadBtn) pdfModalDownloadBtn.href = pdfUrl;

    pdfModal.classList.remove('hidden');
    pdfModal.classList.add('flex');
    document.body.style.overflow = 'hidden';
  }

  function closePdfModal() {
    if (!pdfModal) return;
    pdfModal.classList.add('hidden');
    pdfModal.classList.remove('flex');
    if (pdfModalFrame) pdfModalFrame.src = '';
    document.body.style.overflow = '';
  }

  // Cambio de informe en el selector desplegable
  if (pdfSelectDropdown) {
    pdfSelectDropdown.addEventListener('change', function () {
      const selectedOption = this.options[this.selectedIndex];
      const pdf = selectedOption.value;
      const title = selectedOption.getAttribute('data-title') || selectedOption.text;

      if (pdfViewerFrame) pdfViewerFrame.src = pdf;
      if (pdfOpenBtn) pdfOpenBtn.href = pdf;
      if (pdfDownloadBtn) pdfDownloadBtn.href = pdf;
    });
  }

  // Botón para expandir el informe actual a pantalla completa
  if (pdfModalBtn && pdfSelectDropdown) {
    pdfModalBtn.addEventListener('click', function () {
      const selectedOption = pdfSelectDropdown.options[pdfSelectDropdown.selectedIndex];
      if (selectedOption) {
        openPdfInModal(
          selectedOption.value,
          selectedOption.getAttribute('data-title') || selectedOption.text
        );
      }
    });
  }

  // Cierre del modal
  if (pdfModalCloseBtn) {
    pdfModalCloseBtn.addEventListener('click', closePdfModal);
  }

  if (pdfModal) {
    pdfModal.addEventListener('click', function (e) {
      if (e.target === pdfModal) {
        closePdfModal();
      }
    });
  }

  // Cerrar con tecla Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && pdfModal && !pdfModal.classList.contains('hidden')) {
      closePdfModal();
    }
  });

  // Botones para abrir cualquier documento directamente en el modal
  document.addEventListener('click', function (e) {
    const trigger = e.target.closest('.view-pdf-modal-btn');
    if (!trigger) return;

    e.preventDefault();
    const pdfUrl = trigger.getAttribute('data-pdf');
    const title = trigger.getAttribute('data-title') || 'Visualizador de Documento';
    if (pdfUrl) {
      openPdfInModal(pdfUrl, title);
    }
  });

  // 3. Buscador y Filtros Globales
  const searchInput = document.getElementById('globalSearchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const filterChips = document.querySelectorAll('.filter-chip');
  const resultCounter = document.getElementById('searchResultCount');
  const searchableCards = document.querySelectorAll('.searchable-item');

  let currentCategory = 'all';
  let searchQuery = '';

  function applyFilters() {
    let visibleCount = 0;
    const query = searchQuery.trim().toLowerCase();

    searchableCards.forEach(function (card) {
      const cardCategory = (card.getAttribute('data-category') || '').toLowerCase();
      const cardInstitution = (card.getAttribute('data-institution') || '').toLowerCase();
      const cardText = (card.textContent || '').toLowerCase();

      // Validación de categoría
      let matchesCategory = false;
      if (currentCategory === 'all') {
        matchesCategory = true;
      } else if (currentCategory === 'ucr' || currentCategory === 'uned') {
        matchesCategory = cardInstitution.includes(currentCategory);
      } else {
        matchesCategory = cardCategory.includes(currentCategory);
      }

      // Validación de búsqueda de texto
      const matchesSearch = query === '' || cardText.includes(query);

      if (matchesCategory && matchesSearch) {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Actualizar contador
    if (resultCounter) {
      if (query !== '' || currentCategory !== 'all') {
        resultCounter.textContent = `${visibleCount} resultados encontrados`;
      } else {
        resultCounter.textContent = `${searchableCards.length} documentos disponibles`;
      }
    }

    if (clearSearchBtn) {
      clearSearchBtn.style.display = query.length > 0 ? 'inline-flex' : 'none';
    }
  }

  // Evento de búsqueda en tiempo real
  if (searchInput) {
    searchInput.addEventListener('input', function (e) {
      searchQuery = e.target.value;
      applyFilters();
    });
  }

  // Botón limpiar búsqueda
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', function () {
      if (searchInput) {
        searchInput.value = '';
        searchQuery = '';
        searchInput.focus();
        applyFilters();
      }
    });
  }

  // Evento de clic en chips de filtro
  filterChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      filterChips.forEach(function (c) { c.classList.remove('active'); });
      this.classList.add('active');
      currentCategory = this.getAttribute('data-filter') || 'all';
      applyFilters();
    });
  });

  // 4. Clic en etiquetas de habilidades / tags para filtrar automáticamente
  document.querySelectorAll('.skill-tag').forEach(function (tag) {
    tag.addEventListener('click', function () {
      const tagText = this.textContent.trim().toLowerCase();
      if (searchInput) {
        searchInput.value = tagText;
        searchQuery = tagText;
        searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        applyFilters();
      }
    });
  });

  // Inicializar contador al cargar
  applyFilters();
});