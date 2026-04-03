export const getAvatarColor = (seed = "") => {
    const gradients = [
        "linear-gradient(135deg, #2563eb, #1e40af)", // blue
        "linear-gradient(135deg, #7c3aed, #4c1d95)", // violet
        "linear-gradient(135deg, #db2777, #9d174d)", // pink
        "linear-gradient(135deg, #dc2626, #7f1d1d)", // red
        "linear-gradient(135deg, #ea580c, #9a3412)", // orange
        "linear-gradient(135deg, #ca8a04, #854d0e)", // gold
        "linear-gradient(135deg, #65a30d, #365314)", // olive
        "linear-gradient(135deg, #16a34a, #14532d)", // green
        "linear-gradient(135deg, #059669, #064e3b)", // emerald
        "linear-gradient(135deg, #0d9488, #134e4a)", // teal
        "linear-gradient(135deg, #0891b2, #164e63)", // cyan
        "linear-gradient(135deg, #0284c7, #0c4a6e)", // sky
        "linear-gradient(135deg, #4f46e5, #312e81)", // indigo
        "linear-gradient(135deg, #9333ea, #581c87)", // purple
        "linear-gradient(135deg, #c026d3, #701a75)", // fuchsia
        "linear-gradient(135deg, #e11d48, #881337)", // rose
        "linear-gradient(135deg, #f43f5e, #7f1d1d)", // deep rose
        "linear-gradient(135deg, #fb7185, #9f1239)", // soft red
        "linear-gradient(135deg, #f97316, #7c2d12)", // deep orange
        "linear-gradient(135deg, #facc15, #78350f)", // yellow strong
        "linear-gradient(135deg, #a3e635, #3f6212)", // lime bright
        "linear-gradient(135deg, #4ade80, #14532d)", // soft green
        "linear-gradient(135deg, #2dd4bf, #134e4a)", // aqua
        "linear-gradient(135deg, #22d3ee, #155e75)", // light cyan
        "linear-gradient(135deg, #38bdf8, #075985)", // light blue
        "linear-gradient(135deg, #818cf8, #3730a3)", // soft indigo
        "linear-gradient(135deg, #c084fc, #6b21a8)", // lavender
        "linear-gradient(135deg, #f472b6, #9d174d)", // soft pink
        "linear-gradient(135deg, #fb923c, #7c2d12)", // warm orange
        "linear-gradient(135deg, #94a3b8, #334155)", // slate neutral
    ];

    let hash = 0;
    const str = String(seed);

    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    return gradients[Math.abs(hash) % gradients.length];
};
