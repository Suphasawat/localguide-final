interface UserProfile {
  FirstName: string;
  LastName: string;
  Nickname: string;
  Avatar: string;
  AuthUser: {
    Email: string;
  };
  Role: {
    Name: string;
  };
}

interface ProfileHeaderProps {
  profile: UserProfile;
}

export default function ProfileHeader({ profile }: ProfileHeaderProps) {
  const getRoleName = (roleName: string) => {
    switch (roleName) {
      case "user":
        return "นักท่องเที่ยว";
      case "guide":
        return "ไกด์ท่องเที่ยว";
      case "admin":
        return "ผู้ดูแลระบบ";
      default:
        return "ผู้ใช้งาน";
    }
  };

  return (
    <div className="bg-blue-600 px-6 py-8">
      <div className="flex items-center space-x-4">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
          {profile.Avatar ? (
            <img
              src={profile.Avatar}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <span className="text-blue-600 text-2xl font-bold">
              {profile.FirstName?.charAt(0) ||
                profile.AuthUser?.Email?.charAt(0) ||
                "U"}
            </span>
          )}
        </div>
        <div className="text-white">
          <h2 className="text-2xl font-bold">
            {profile.FirstName || profile.LastName
              ? `${profile.FirstName} ${profile.LastName}`
              : profile.Nickname || "ผู้ใช้งาน"}
          </h2>
          <p className="text-blue-100">{profile.AuthUser?.Email}</p>
          <p className="text-blue-100">{getRoleName(profile.Role?.Name)}</p>
        </div>
      </div>
    </div>
  );
}
