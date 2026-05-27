import { publicUrlFor } from "../../globals/constants";

function JobZImage(props) {
    const src = props.src;
    // Use external URLs (http/https) directly, local assets via publicUrlFor
    const processedSrc = src && (src.startsWith('http://') || src.startsWith('https://')) ? src : publicUrlFor(src);

    return(
        <>
            <img {...props} src={processedSrc} alt={props.alt}/>
        </>
    )
}

export default JobZImage;
