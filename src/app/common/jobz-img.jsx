import { publicUrlFor } from "../../globals/constants";
import { getJobImageUrl } from "../../globals/file-url";

function JobZImage(props) {
    const src = props.src;
    let processedSrc;

    if (!src) {
        processedSrc = src;
    } else if (src.startsWith('/api/')) {
        // Already a proxied API URL
        processedSrc = src;
    } else if (src.startsWith('http://') || src.startsWith('https://')) {
        // External URL - proxy through API
        processedSrc = getJobImageUrl(src);
    } else {
        // Relative path - use public URL
        processedSrc = publicUrlFor(src);
    }

    return(
        <>
            <img {...props} src={processedSrc} alt={props.alt}/>
        </>
    )
}

export default JobZImage;
