import {Platform} from 'react-native';
import codePush from 'react-native-code-push';

const CODEPUSH_ANDROID_KEY = 'iBfzrBb1TTD1jZyazQKslU4Wr7WC4ksvOXqog';
const CODEPUSH_IOS_KEY = '';
export const CODEPUSH_DEPLOYMENTKEY = () => {
  if (Platform.OS === 'android') {
    return CODEPUSH_ANDROID_KEY;
  } else {
    return CODEPUSH_IOS_KEY;
  }
};

export const getStatusFromCodePush = status => {
  switch (status) {
    case codePush.SyncStatus.CHECKING_FOR_UPDATE:
      return 'CHECKING_FOR_UPDATE';
    case codePush.SyncStatus.DOWNLOADING_PACKAGE:
      return 'DOWNLOADING_PACKAGE';
    case codePush.SyncStatus.INSTALLING_UPDATE:
      return 'INSTALLING_UPDATE';
    case codePush.SyncStatus.UP_TO_DATE:
      return 'UP_TO_DATE';
    case codePush.SyncStatus.UPDATE_INSTALLED:
      return 'UPDATE_INSTALLED';
    case codePush.SyncStatus.UPDATE_IGNORED:
    case codePush.SyncStatus.UNKNOWN_ERROR:
      return 'ERROR'; // Tổng hợp các trạng thái lỗi
    default:
      return 'CHECK_UPDATE'; // Trạng thái không xác định
  }
};
