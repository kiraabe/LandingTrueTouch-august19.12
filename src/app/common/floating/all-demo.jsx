function AllDemoFloatingMenu(props) {
    return (
        <>
            <a href="#"
                id="all-demo-open"
                className="all-demos-view"
                onClick={(e) => {
                    e.preventDefault();
                    props.onClick();
                }}
            >All Demo</a>
        </>
    )
}

export default AllDemoFloatingMenu;
