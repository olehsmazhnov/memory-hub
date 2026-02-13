import { FOLDER_SORT_STEP } from '../constants/ui';
import type { Folder } from '../types';

export const getNextFolderSortOrder = (folderList: Folder[]) => {
  const maxOrder = folderList.reduce((maxValue, folder) => {
    if (Number.isFinite(folder.sort_order)) {
      return Math.max(maxValue, folder.sort_order);
    }
    return maxValue;
  }, 0);

  return maxOrder + FOLDER_SORT_STEP;
};

export const applyFolderSortOrder = (folderList: Folder[]) => {
  const listSize = folderList.length;

  return folderList.map((folder, index) => ({
    ...folder,
    sort_order: (listSize - index) * FOLDER_SORT_STEP
  }));
};
