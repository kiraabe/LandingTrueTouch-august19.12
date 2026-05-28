import { publicUrlFor } from "../../globals/constants";
import { getJobImageUrl } from "../../globals/file-url";

function JobZImage(props) {
    const src = props.src;
    // Only process relative paths; full URLs are already handled
    const processedSrc = src && (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/api/'))
        ? src
        : publicUrlFor(src);

    return(
        <>
            <img {...props} src={processedSrc} alt={props.alt}/>
        </>
    )
}

export default JobZImage;
