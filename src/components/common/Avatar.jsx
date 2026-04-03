import { getInitials } from "../../utils/getInitials";
import { getAvatarColor } from "../../utils/getAvatarColor";

export default function Avatar({ name, seed }) {
    const bg = getAvatarColor(seed);

    return (
        <div
            className="avatar"
            style={{ background: bg }}
        >
            {getInitials(name)}
        </div>
    );
}
