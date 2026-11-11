
import { useEffect, useState } from 'react';
import { auth } from '../../config/firebase';
import { updateProfile } from 'firebase/auth';
import Swal from 'sweetalert2';

// const API_URL =
//     import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = 'http://localhost:5000';

const SettingsPage = () => {
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
        photoURL: ''
    });

    const [selectedImage, setSelectedImage] = useState(null);
    const [preview, setPreview] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // SweetAlert2 Theme
    const swalTheme = {
        customClass: {
            popup: 'mochi-swal-popup',
            title: 'mochi-swal-title',
            htmlContainer: 'mochi-swal-text',
            confirmButton: 'mochi-swal-confirm',
            cancelButton: 'mochi-swal-cancel'
        },
        buttonsStyling: true,
        confirmButtonColor: '#F28C28',
        cancelButtonColor: '#81766D'
    };

    // Load Admin Profile
    useEffect(() => {
        let active = true;

        const loadProfile = async () => {
            try {
                const user = auth.currentUser;

                if (!user) {
                    throw new Error('Please login again.');
                }

                const token = await user.getIdToken();

                const response = await fetch(
                    `${API_URL}/api/admin/profile`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.error || 'Could not load profile.'
                    );
                }

                if (!active) return;

                const userProfile = data.profile;

                setProfile({
                    name:
                        userProfile.name ||
                        user.displayName ||
                        '',
                    email: userProfile.email || user.email || '',
                    phone: userProfile.phone || '',
                    photoURL:
                        userProfile.photoURL ||
                        user.photoURL ||
                        ''
                });

                setPreview(
                    userProfile.photoURL || user.photoURL || ''
                );

            } catch (error) {
                if (active) {
                    Swal.fire({
                        ...swalTheme,
                        icon: 'error',
                        title: 'Profile Loading Failed',
                        text: error.message
                    });
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        loadProfile();

        return () => {
            active = false;
        };
    }, []);

    // Handle Text Inputs
    const handleChange = (event) => {
        const { name, value } = event.target;

        setProfile((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    // Select Profile Picture
    const handleImageChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/webp'
        ];

        if (!allowedTypes.includes(file.type)) {
            Swal.fire({
                ...swalTheme,
                icon: 'warning',
                title: 'Invalid Image',
                text: 'Please select a JPG, PNG or WEBP image.'
            });

            event.target.value = '';
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            Swal.fire({
                ...swalTheme,
                icon: 'warning',
                title: 'Image Too Large',
                text: 'Please select an image smaller than 5 MB.'
            });

            event.target.value = '';
            return;
        }

        setSelectedImage(file);
        setPreview(URL.createObjectURL(file));
    };

    // Save Profile
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (saving) return;

        const user = auth.currentUser;

        if (!user) {
            await Swal.fire({
                ...swalTheme,
                icon: 'error',
                title: 'Authentication Required',
                text: 'Please login again.'
            });

            return;
        }

        if (!profile.name.trim()) {
            await Swal.fire({
                ...swalTheme,
                icon: 'warning',
                title: 'Name Required',
                text: 'Please enter your name.'
            });

            return;
        }

        setSaving(true);

        try {
            const token = await user.getIdToken();

            let photoURL = profile.photoURL;
            let photoPublicId = undefined;

            // Upload Selected Image to Cloudinary
            if (selectedImage) {
                const formData = new FormData();
                formData.append('image', selectedImage);

                const uploadResponse = await fetch(
                    `${API_URL}/api/uploads/profile`,
                    {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                        body: formData
                    }
                );

                const uploadData = await uploadResponse.json();

                if (!uploadResponse.ok) {
                    throw new Error(
                        uploadData.error || 'Image upload failed.'
                    );
                }

                photoURL = uploadData.image.url;
                photoPublicId = uploadData.image.publicId;
            }

            // Update MongoDB Profile
            const updateResponse = await fetch(
                `${API_URL}/api/admin/profile`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        name: profile.name.trim(),
                        phone: profile.phone.trim(),
                        photoURL,
                        ...(photoPublicId && { photoPublicId })
                    })
                }
            );

            const updateData = await updateResponse.json();

            if (!updateResponse.ok) {
                throw new Error(
                    updateData.error || 'Profile update failed.'
                );
            }

            // Sync Firebase Display Name and Photo
            await updateProfile(user, {
                displayName: profile.name.trim(),
                ...(photoURL && { photoURL })
            });

            setProfile((previous) => ({
                ...previous,
                name: profile.name.trim(),
                photoURL: photoURL || ''
            }));

            setPreview(photoURL || '');
            setSelectedImage(null);

            await Swal.fire({
                ...swalTheme,
                icon: 'success',
                title: 'Profile Updated!',
                text: 'Your MochiMart admin profile has been updated successfully.',
                confirmButtonText: 'Great!',
                allowOutsideClick: false
            });

            // Refresh profile after successful update
            window.dispatchEvent(
                new Event('adminProfileUpdated')
            );

        } catch (error) {
            console.error('Profile update error:', error);

            await Swal.fire({
                ...swalTheme,
                icon: 'error',
                title: 'Update Failed!',
                text: error.message || 'Something went wrong.',
                confirmButtonText: 'Try Again'
            });

        } finally {
            setSaving(false);
        }
    };

    // Loading Screen
    if (loading) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center bg-base-200 text-base-content">
                <span className="loading loading-spinner loading-lg text-primary"></span>
                <p className="mt-4 text-sm text-base-content/60">
                    Loading your profile...
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-200 p-4 text-base-content sm:p-6 lg:p-8">

            <div className="mx-auto max-w-5xl">

                {/* Page Heading */}
                <div className="mb-8">
                    <p className="text-xs font-bold tracking-[0.2em] text-primary">
                        ACCOUNT MANAGEMENT
                    </p>

                    <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">
                        Profile Settings
                    </h1>

                    <p className="mt-2 text-sm text-base-content/60">
                        Manage your admin account and personal information.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>

                    <div className="grid gap-6 lg:grid-cols-3">

                        {/* Profile Picture Card */}
                        <div className="h-fit rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm">

                            <h2 className="text-lg font-bold">
                                Profile Picture
                            </h2>

                            <p className="mt-1 text-sm text-base-content/50">
                                Update your account photo.
                            </p>

                            {/* Avatar */}
                            <div className="mt-7 flex flex-col items-center">

                                <div className="relative h-36 w-36">

                                    <div className="h-full w-full overflow-hidden rounded-full border-4 border-primary bg-secondary shadow-lg">

                                        {preview ? (
                                            <img
                                                src={preview}
                                                alt="Admin Profile"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-5xl font-bold text-primary">
                                                {profile.name
                                                    ?.charAt(0)
                                                    ?.toUpperCase() || 'A'}
                                            </div>
                                        )}

                                    </div>

                                    <label
                                        htmlFor="profile-image"
                                        className="absolute bottom-1 right-1 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-4 border-base-100 bg-primary text-primary-content shadow-lg transition hover:scale-110"
                                        title="Upload profile picture"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M12 20h9" />
                                            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L9 17l-4 1 1-4Z" />
                                        </svg>
                                    </label>

                                    <input
                                        id="profile-image"
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />

                                </div>

                                <h3 className="mt-5 text-xl font-bold">
                                    {profile.name || 'Admin'}
                                </h3>

                                <p className="mt-1 text-sm text-base-content/50">
                                    Administrator
                                </p>

                                <p className="mt-5 text-center text-xs leading-6 text-base-content/50">
                                    JPG, PNG or WEBP.
                                    <br />
                                    Maximum file size: 5 MB.
                                </p>

                                {selectedImage && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedImage(null);
                                            setPreview(profile.photoURL || '');
                                        }}
                                        className="mt-3 text-xs font-semibold text-error hover:underline"
                                    >
                                        Remove selected image
                                    </button>
                                )}

                            </div>
                        </div>

                        {/* Personal Information */}
                        <div className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm lg:col-span-2">

                            <h2 className="text-lg font-bold">
                                Personal Information
                            </h2>

                            <p className="mt-1 text-sm text-base-content/50">
                                Update your account details below.
                            </p>

                            <div className="mt-7 space-y-5">

                                {/* Full Name */}
                                <div>
                                    <label
                                        htmlFor="admin-name"
                                        className="mb-2 block text-sm font-semibold"
                                    >
                                        Full Name
                                    </label>

                                    <input
                                        id="admin-name"
                                        type="text"
                                        name="name"
                                        value={profile.name}
                                        onChange={handleChange}
                                        placeholder="Enter your full name"
                                        maxLength={80}
                                        required
                                        className="input input-bordered w-full bg-base-100 text-base-content focus:border-primary focus:outline-none"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label
                                        htmlFor="admin-email"
                                        className="mb-2 block text-sm font-semibold"
                                    >
                                        Email Address
                                    </label>

                                    <input
                                        id="admin-email"
                                        type="email"
                                        value={profile.email}
                                        readOnly
                                        className="input input-bordered w-full cursor-not-allowed bg-secondary text-base-content/60"
                                    />

                                    <p className="mt-2 text-xs text-base-content/50">
                                        Email is connected to your Firebase login account.
                                    </p>
                                </div>

                                {/* Phone */}
                                <div>
                                    <label
                                        htmlFor="admin-phone"
                                        className="mb-2 block text-sm font-semibold"
                                    >
                                        Phone Number
                                    </label>

                                    <input
                                        id="admin-phone"
                                        type="tel"
                                        name="phone"
                                        value={profile.phone}
                                        onChange={handleChange}
                                        placeholder="Enter your phone number"
                                        maxLength={30}
                                        className="input input-bordered w-full bg-base-100 text-base-content focus:border-primary focus:outline-none"
                                    />
                                </div>

                            </div>

                            {/* Save Button */}
                            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-base-300 pt-6 sm:flex-row sm:justify-end">

                                <button
                                    type="button"
                                    disabled={saving}
                                    onClick={() => {
                                        setProfile((previous) => ({
                                            ...previous,
                                            name:
                                                auth.currentUser?.displayName || '',
                                            phone: previous.phone
                                        }));

                                        setSelectedImage(null);
                                        setPreview(profile.photoURL || '');
                                    }}
                                    className="rounded-xl border border-base-300 px-6 py-3 font-semibold text-base-content transition hover:bg-secondary disabled:opacity-50"
                                >
                                    Cancel Image Selection
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3 font-bold text-primary-content shadow-md transition hover:-translate-y-0.5 hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {saving ? (
                                        <>
                                            <span className="loading loading-spinner loading-sm"></span>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            Save Changes
                                            <span>→</span>
                                        </>
                                    )}
                                </button>

                            </div>

                        </div>

                    </div>

                </form>
            </div>
        </div>
    );
};

export default SettingsPage;
