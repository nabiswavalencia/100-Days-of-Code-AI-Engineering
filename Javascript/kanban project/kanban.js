// Make every card draggable between columns
const cards = document.querySelectorAll('.card');
cards.forEach(makeDraggable);

function makeDraggable(card) {
    let startX = 0, startY = 0;   // pointer position when the drag started
    let dragging = false;

    card.onpointerdown = startDrag;

    function startDrag(e) {
        e.preventDefault();

        startX = e.clientX;
        startY = e.clientY;
        dragging = true;

        card.classList.add('dragging');
        // route all further pointer events to this card, even outside it
        card.setPointerCapture(e.pointerId);

        card.onpointermove = onDrag;
        card.onpointerup = endDrag;
    }

    function onDrag(e) {
        if (!dragging) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        // move with the pointer without disturbing the layout
        card.style.transform =
            `translate(${dx}px, ${dy}px) rotate(2deg) scale(1.03)`;
    }

    function endDrag(e) {
        dragging = false;
        card.classList.remove('dragging');
        card.style.transform = '';

        card.releasePointerCapture(e.pointerId);
        card.onpointermove = null;
        card.onpointerup = null;

        // figure out which column the card was dropped on
        card.style.visibility = 'hidden';
        const dropPoint = document.elementFromPoint(e.clientX, e.clientY);
        card.style.visibility = '';

        const column = dropPoint && dropPoint.closest('.column');
        if (column) {
            column.appendChild(card);   // drop it at the bottom of that column
        }
    }
}
