// src/app/account.js
import { useState, useEffect } from 'react';

const AccountPage = () => {
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        fetch("/api/banya/get-profile/")
            .then((res) => res.json())
            .then((data) => setUserInfo(data))
            .catch(console.error);
    }, []);

    if (!userInfo) return <p>Loading...</p>;

    return (
        <div>
            <h1>My Profile</h1>
            <img src={`/media/${userInfo.avatar}`} alt="Avatar" style={{ width: "100px", height: "auto" }} />
            <p>Full Name: {userInfo.first_name} {userInfo.last_name}</p>
            <p>Email: {userInfo.email}</p>
            <p>Phone: {userInfo.phone_number}</p>
        </div>
    );
};

export default AccountPage;
