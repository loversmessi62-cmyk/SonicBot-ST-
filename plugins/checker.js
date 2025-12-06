document.getElementById("file").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    const text = await file.text();

    // Convertir archivo en un array de líneas limpias
    const numbers = text
        .split(/\r?\n/)
        .map(n => n.replace(/\s+/g, "").trim())
        .filter(n => n.length > 0);

    // Función para contar el dígito que más se repite
    function maxRepeatedDigits(num) {
        const counts = {};
        for (let c of num) {
            if (!/[0-9]/.test(c)) continue;
            counts[c] = (counts[c] || 0) + 1;
        }
        const max = Math.max(...Object.values(counts));
        return max;
    }

    // Crear lista con repeticiones
    const evaluated = numbers.map(num => ({
        num,
        repeats: maxRepeatedDigits(num)
    }));

    // Ordenar por los que más repiten
    evaluated.sort((a, b) => b.repeats - a.repeats);

    // Filtrar solo los que tengan mínimo 6 dígitos iguales
    const filtered = evaluated.filter(e => e.repeats >= 6);

    // Tomar los primeros 10
    const top10 = filtered.slice(0, 10);

    console.log("TOP 10 con más dígitos repetidos:");
    console.table(top10);
});
