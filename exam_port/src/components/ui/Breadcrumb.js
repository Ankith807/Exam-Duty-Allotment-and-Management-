import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { ChevronRight, Home } from 'lucide-react-native';

const Breadcrumb = ({ 
  items = [], 
  onItemPress,
  showHome = true,
  homeTitle = "Dashboard",
  separator = "chevron" // "chevron" or "slash"
}) => {
  const renderSeparator = () => {
    if (separator === "slash") {
      return <Text style={styles.slashSeparator}>/</Text>;
    }
    return <ChevronRight size={16} color="#9CA3AF" style={styles.chevronSeparator} />;
  };

  const renderHomeItem = () => {
    if (!showHome) return null;
    
    return (
      <>
        <TouchableOpacity
          style={styles.breadcrumbItem}
          onPress={() => onItemPress && onItemPress({ id: 'home', title: homeTitle })}
        >
          <Home size={16} color="#6B7280" style={styles.homeIcon} />
          <Text style={styles.homeText}>{homeTitle}</Text>
        </TouchableOpacity>
        {items.length > 0 && renderSeparator()}
      </>
    );
  };

  const renderBreadcrumbItem = (item, index) => {
    const isLast = index === items.length - 1;
    const isClickable = !isLast && onItemPress;

    return (
      <React.Fragment key={item.id || index}>
        <TouchableOpacity
          style={[
            styles.breadcrumbItem,
            !isClickable && styles.disabledItem
          ]}
          onPress={isClickable ? () => onItemPress(item) : undefined}
          disabled={!isClickable}
        >
          {item.icon && (
            <View style={styles.itemIcon}>
              {item.icon}
            </View>
          )}
          <Text
            style={[
              styles.breadcrumbText,
              isLast && styles.currentText,
              !isClickable && styles.disabledText
            ]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
        </TouchableOpacity>
        {!isLast && renderSeparator()}
      </React.Fragment>
    );
  };

  if (items.length === 0 && !showHome) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.breadcrumbContainer}>
          {renderHomeItem()}
          {items.map(renderBreadcrumbItem)}
        </View>
      </ScrollView>
    </View>
  );
};

// Helper function to create breadcrumb items
export const createBreadcrumbItem = (id, title, icon = null) => ({
  id,
  title,
  icon,
});

// Predefined breadcrumb configurations for common sections
export const getBreadcrumbsForSection = (section, subsection = null) => {
  const breadcrumbs = [];

  switch (section) {
    case 'select-dates':
      breadcrumbs.push(createBreadcrumbItem('select-dates', 'Select Exam Dates'));
      break;
    case 'view-dates':
      breadcrumbs.push(createBreadcrumbItem('view-dates', 'View Selected Dates'));
      break;
    case 'exam_history':
      breadcrumbs.push(createBreadcrumbItem('exam_history', 'Exam History'));
      break;
    case 'profile':
      breadcrumbs.push(createBreadcrumbItem('profile', 'Profile'));
      if (subsection === 'edit') {
        breadcrumbs.push(createBreadcrumbItem('profile-edit', 'Edit Profile'));
      }
      break;
    case 'faculty-duty':
      breadcrumbs.push(createBreadcrumbItem('faculty-duty', 'Faculty Duty Management'));
      break;
    case 'exam-dates':
      breadcrumbs.push(createBreadcrumbItem('exam-dates', 'Exam Dates'));
      break;
    case 'faculty-management':
      breadcrumbs.push(createBreadcrumbItem('faculty-management', 'Faculty Management'));
      break;
    case 'reports':
      breadcrumbs.push(createBreadcrumbItem('reports', 'Reports'));
      break;
    case 'settings':
      breadcrumbs.push(createBreadcrumbItem('settings', 'Settings'));
      break;
    default:
      break;
  }

  return breadcrumbs;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  breadcrumbContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 24,
  },
  breadcrumbItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    maxWidth: 200,
  },
  disabledItem: {
    opacity: 0.7,
  },
  homeIcon: {
    marginRight: 6,
  },
  itemIcon: {
    marginRight: 6,
  },
  homeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  breadcrumbText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  currentText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  disabledText: {
    color: '#9CA3AF',
  },
  chevronSeparator: {
    marginHorizontal: 8,
  },
  slashSeparator: {
    fontSize: 14,
    color: '#9CA3AF',
    marginHorizontal: 8,
    fontWeight: '400',
  },
});

export default Breadcrumb;
