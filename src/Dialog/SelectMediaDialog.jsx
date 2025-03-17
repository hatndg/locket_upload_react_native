/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  Text,
  Dialog,
  Colors,
  Icon,
  TouchableOpacity,
  Typography,
  View,
} from 'react-native-ui-lib';
import CustomDialog from './CustomDialog';
import {requestCameraPermission} from '../util/permission';

const SelectMediaDialog = ({
  visible,
  onDismiss = () => {},
  onConfirm = () => {},
}) => {
  const handlePressCamera = async () => {
    await requestCameraPermission();
    onDismiss();
    onConfirm('camera');
  };

  const handlePressGallery = () => {
    onDismiss();
    onConfirm('gallery');
  };

  return (
    <CustomDialog
      visible={visible}
      onDismiss={onDismiss}
      title={'Select media from'}
      panDirection={Dialog.directions.DOWN}
      bottom
      width={'98%'}
      containerStyle={{
        backgroundColor: 'black',
        borderWidth: 1,
        borderBottomWidth: 0,
        borderRadiusBottomLeft: 0,
        borderRadiusBottomRight: 0,
        borderColor: Colors.grey20,
        gap: 4,
        padding: 12,
        borderRadius: 10,
        paddingBottom: 24,
      }}
      titleStyle={{
        color: 'white',
        ...Typography.text60BL,
      }}>
      <TouchableOpacity
        paddingH-20
        paddingV-10
        centerV
        spread
        row
        onPress={handlePressCamera}>
        <Text white text70BL>
          Camera
        </Text>
        <Icon
          assetGroup="icons"
          assetName="ic_camera"
          size={28}
          tintColor={Colors.primary}
        />
      </TouchableOpacity>
      <View height={1} bg-grey40 />
      <TouchableOpacity
        paddingH-20
        paddingV-10
        centerV
        spread
        row
        onPress={handlePressGallery}>
        <Text white text70BL>
          Gallery
        </Text>
        <Icon
          assetGroup="icons"
          assetName="ic_gallery"
          size={28}
          tintColor={Colors.primary}
        />
      </TouchableOpacity>
    </CustomDialog>
  );
};

export default SelectMediaDialog;
