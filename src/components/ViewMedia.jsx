/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, TouchableOpacity, Colors, Image, Icon} from 'react-native-ui-lib';
import Video from 'react-native-video';

const ViewMedia = ({selectedMedia, isVideo, onSelectMedia, onRemoveMedia}) => {
  console.log(selectedMedia);

  return (
    <View center>
      <TouchableOpacity
        style={{
          borderRadius: 8,
          borderWidth: 2,
          borderColor: Colors.grey40,
        }}
        onPress={onSelectMedia}>
        {selectedMedia ? (
          !isVideo ? (
            <View>
              <Image
                width={264}
                height={264}
                source={{uri: selectedMedia.uri}}
                style={{borderRadius: 6}}
              />
              <View absT marginT-4 marginR-4 absR>
                <TouchableOpacity onPress={onRemoveMedia}>
                  <Icon
                    assetGroup="icons"
                    assetName="ic_cancel"
                    size={24}
                    tintColor={Colors.red30}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View>
              <Video
                source={{uri: selectedMedia.uri}}
                resizeMode="cover"
                style={{borderRadius: 6, width: 264, height: 264}}
              />
              <View absT marginT-4 marginR-4 absR>
                <TouchableOpacity onPress={onRemoveMedia}>
                  <Icon
                    assetGroup="icons"
                    assetName="ic_cancel"
                    size={24}
                    tintColor={Colors.red30}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )
        ) : (
          <Icon
            assetGroup="icons"
            assetName="ic_add"
            tintColor={Colors.grey40}
            size={64}
            margin-100
          />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default ViewMedia;
