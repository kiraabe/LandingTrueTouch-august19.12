import { publicUrlFor } from "../../globals/constants";
import { getJobImageUrl } from "../../globals/file-url";

function JobZImage(props) {
    const src = props.src;
    // Route external URLs and relative paths through appropriate handlers
    const processedSrc = src && (src.startsWith('http://') || src.startsWith('https://'))
        ? getJobImageUrl(src)
        : publicUrlFor(src);

    return(
        <>
            <img {...props} src={processedSrc} alt={props.alt}/>
        </>
    )
}

export default JobZImage;
