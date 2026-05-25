import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const Avatar = ({
  user,
  size = 'md',
  showBorder = false,
  borderColor = '#ffffff'
}) => {
  const sizeMap = {
    xs: 24,
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96,
    '2xl': 128,
  };

  const avatarSize = sizeMap[size] || 48;

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const generateAvatarUrl = (name, size) => {
    const initials = getInitials(name);
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      initials
    )}&background=3b82f6&color=ffffff&size=${size}&font-size=0.6&bold=true`;
  };

  const defaultImage = `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=${avatarSize}&h=${avatarSize}&q=80`;

  const [imageUri, setImageUri] = React.useState(
    user?.profile_picture ? user.profile_picture : defaultImage
  );

  const onImageError = () => {
    setImageUri(generateAvatarUrl(user?.name, avatarSize));
  };

  return (
    <View
      style={[
        styles.avatarContainer,
        {
          width: avatarSize,
          height: avatarSize,
          borderRadius: avatarSize / 2,
          borderWidth: showBorder ? 4 : 0,
          borderColor: borderColor,
        },
      ]}
    >
      <Image
        source={{ uri: imageUri }}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: avatarSize / 2,
        }}
        resizeMode="cover"
        onError={onImageError}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  avatarContainer: {
    overflow: 'hidden',
    backgroundColor: '#3b82f6', // fallback gradient replacement
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4, // Android shadow
  },
});

export default Avatar;
