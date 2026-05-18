import { Route, Routes } from "react-router-dom";
import { publicUser } from "../globals/route-names";
import Home18Page from "../app/pannels/public-user/components/home/Home18";

function PublicUserRoutes() {
    return (
        <Routes>
            <Route path={publicUser.INITIAL} element={<Home18Page />} />
            <Route path={publicUser.HOME18} element={<Home18Page />} />
            <Route path="*" element={<Home18Page />} />
        </Routes>
    )
}

export default PublicUserRoutes;
