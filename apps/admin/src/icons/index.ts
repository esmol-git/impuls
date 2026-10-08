import type { Component } from 'vue'

import IconAirplay from '@/assets/icons/airplay.svg'
import IconArchive from '@/assets/icons/archive.svg'
import IconArrowChevronLeft from '@/assets/icons/arrow-chevron-left.svg'
import IconArrowLeft from '@/assets/icons/arrow-left.svg'
import IconArrowLeftToLine from '@/assets/icons/arrow-left-to-line.svg'
import IconArrowLogIn from '@/assets/icons/arrow-log-in.svg'
import IconArrowLogOut from '@/assets/icons/arrow-log-out.svg'
import IconBell2 from '@/assets/icons/bell-2.svg'
import IconBookmark from '@/assets/icons/bookmark.svg'
import IconBulletedList from '@/assets/icons/bulleted-list.svg'
import IconCalendar from '@/assets/icons/calendar.svg'
import IconCart from '@/assets/icons/cart.svg'
import IconClock from '@/assets/icons/clock.svg'
import IconCombine from '@/assets/icons/combine.svg'
import IconCopy from '@/assets/icons/copy.svg'
import IconCoupon from '@/assets/icons/coupon.svg'
import IconDragMove from '@/assets/icons/drag-move.svg'
import IconDrop from '@/assets/icons/drop.svg'
import IconEdit from '@/assets/icons/edit.svg'
import IconFemale from '@/assets/icons/female.svg'
import IconFile from '@/assets/icons/file.svg'
import IconFilePlus from '@/assets/icons/file-plus.svg'
import IconFlag from '@/assets/icons/flag.svg'
import IconFolder from '@/assets/icons/folder.svg'
import IconFontColor from '@/assets/icons/font-color.svg'
import IconGlobal from '@/assets/icons/global.svg'
import IconHeading from '@/assets/icons/heading.svg'
import IconHeart from '@/assets/icons/heart.svg'
import IconHome1 from '@/assets/icons/home-1.svg'
import IconHome2 from '@/assets/icons/home-2.svg'
import IconHome4 from '@/assets/icons/home-4.svg'
import IconHonour from '@/assets/icons/honour.svg'
import IconImage from '@/assets/icons/image.svg'
import IconInformation from '@/assets/icons/information.svg'
import IconLayoutGrid from '@/assets/icons/layout-grid.svg'
import IconLinks from '@/assets/icons/links.svg'
import IconLock from '@/assets/icons/lock.svg'
import IconMail from '@/assets/icons/mail.svg'
import IconMailSend from '@/assets/icons/mail-send.svg'
import IconMailUnread from '@/assets/icons/mail-unread.svg'
import IconMale from '@/assets/icons/male.svg'
import IconMap from '@/assets/icons/map.svg'
import IconMapPin1 from '@/assets/icons/map-pin-1.svg'
import IconMapPin2 from '@/assets/icons/map-pin-2.svg'
import IconMedal from '@/assets/icons/medal.svg'
import IconMenu1 from '@/assets/icons/menu-1.svg'
import IconMenu2 from '@/assets/icons/menu-2.svg'
import IconMenu3 from '@/assets/icons/menu-3.svg'
import IconMenuFold from '@/assets/icons/menu-fold.svg'
import IconMenuUnfold from '@/assets/icons/menu-unfold.svg'
import IconMessage1 from '@/assets/icons/message-1.svg'
import IconMessage2 from '@/assets/icons/message-2.svg'
import IconMessage3 from '@/assets/icons/message-3.svg'
import IconMonitor from '@/assets/icons/monitor.svg'
import IconMoreHorizontal from '@/assets/icons/more-horizontal.svg'
import IconMoreVertical from '@/assets/icons/more-vertical.svg'
import IconPaperClip from '@/assets/icons/paper-clip.svg'
import IconPhone from '@/assets/icons/phone.svg'
import IconPower from '@/assets/icons/power.svg'
import IconPriceTag from '@/assets/icons/price-tag.svg'
import IconQrScan from '@/assets/icons/qr-scan.svg'
import IconQuestionMark from '@/assets/icons/question-mark.svg'
import IconReports from '@/assets/icons/reports.svg'
import IconSearch from '@/assets/icons/search.svg'
import IconServer from '@/assets/icons/server.svg'
import IconSettings2 from '@/assets/icons/settings-2.svg'
import IconSettingsSlider from '@/assets/icons/settings-slider.svg'
import IconShoppingBag from '@/assets/icons/shopping-bag.svg'
import IconSpacingHeight from '@/assets/icons/spacing-height.svg'
import IconSpacingWidth from '@/assets/icons/spacing-width.svg'
import IconStack from '@/assets/icons/stack.svg'
import IconStar from '@/assets/icons/star.svg'
import IconStickyNote from '@/assets/icons/sticky-note.svg'
import IconStock from '@/assets/icons/stock.svg'
import IconTask from '@/assets/icons/task.svg'
import IconText from '@/assets/icons/text.svg'
import IconTimer from '@/assets/icons/timer.svg'
import IconTrash from '@/assets/icons/trash.svg'
import IconUnlock from '@/assets/icons/unlock.svg'
import IconUser from '@/assets/icons/user.svg'
import IconUserPlus from '@/assets/icons/user-plus.svg'
import IconUndo from '@/assets/icons/undo.svg'
import IconRedo from '@/assets/icons/redo.svg'
import IconZoomIn from '@/assets/icons/zoom-in.svg'
import IconZoomOut from '@/assets/icons/zoom-out.svg'

export const icons = {
  'airplay': IconAirplay,
  'archive': IconArchive,
  'arrow-chevron-left': IconArrowChevronLeft,
  'arrow-left': IconArrowLeft,
  'arrow-left-to-line': IconArrowLeftToLine,
  'arrow-log-in': IconArrowLogIn,
  'arrow-log-out': IconArrowLogOut,
  'bell-2': IconBell2,
  'bookmark': IconBookmark,
  'bulleted-list': IconBulletedList,
  'calendar': IconCalendar,
  'cart': IconCart,
  'clock': IconClock,
  'combine': IconCombine,
  'copy': IconCopy,
  'coupon': IconCoupon,
  'drag-move': IconDragMove,
  'drop': IconDrop,
  'edit': IconEdit,
  'female': IconFemale,
  'file': IconFile,
  'file-plus': IconFilePlus,
  'flag': IconFlag,
  'folder': IconFolder,
  'font-color': IconFontColor,
  'global': IconGlobal,
  'heading': IconHeading,
  'heart': IconHeart,
  'home-1': IconHome1,
  'home-2': IconHome2,
  'home-4': IconHome4,
  'honour': IconHonour,
  'image': IconImage,
  'information': IconInformation,
  'layout-grid': IconLayoutGrid,
  'links': IconLinks,
  'lock': IconLock,
  'mail': IconMail,
  'mail-send': IconMailSend,
  'mail-unread': IconMailUnread,
  'male': IconMale,
  'map': IconMap,
  'map-pin-1': IconMapPin1,
  'map-pin-2': IconMapPin2,
  'medal': IconMedal,
  'menu-1': IconMenu1,
  'menu-2': IconMenu2,
  'menu-3': IconMenu3,
  'menu-fold': IconMenuFold,
  'menu-unfold': IconMenuUnfold,
  'message-1': IconMessage1,
  'message-2': IconMessage2,
  'message-3': IconMessage3,
  'monitor': IconMonitor,
  'more-horizontal': IconMoreHorizontal,
  'more-vertical': IconMoreVertical,
  'paper-clip': IconPaperClip,
  'phone': IconPhone,
  'power': IconPower,
  'price-tag': IconPriceTag,
  'qr-scan': IconQrScan,
  'question-mark': IconQuestionMark,
  'reports': IconReports,
  'search': IconSearch,
  'server': IconServer,
  'settings-2': IconSettings2,
  'settings-slider': IconSettingsSlider,
  'shopping-bag': IconShoppingBag,
  'spacing-height': IconSpacingHeight,
  'spacing-width': IconSpacingWidth,
  'stack': IconStack,
  'star': IconStar,
  'sticky-note': IconStickyNote,
  'stock': IconStock,
  'task': IconTask,
  'text': IconText,
  'timer': IconTimer,
  'trash': IconTrash,
  'undo': IconUndo,
  'unlock': IconUnlock,
  'user': IconUser,
  'user-plus': IconUserPlus,
  'redo': IconRedo,
  'zoom-in': IconZoomIn,
  'zoom-out': IconZoomOut,
} as const satisfies Record<string, Component>

export type IconName = keyof typeof icons

export function getIcon(name: IconName): Component {
  return icons[name]
}

/** CamelCase aliases for :icon bindings */
export const icon = {
  airplay: icons['airplay'],
  archive: icons['archive'],
  arrowChevronLeft: icons['arrow-chevron-left'],
  arrowLeft: icons['arrow-left'],
  arrowLeftToLine: icons['arrow-left-to-line'],
  arrowLogIn: icons['arrow-log-in'],
  arrowLogOut: icons['arrow-log-out'],
  bell2: icons['bell-2'],
  bookmark: icons['bookmark'],
  bulletedList: icons['bulleted-list'],
  calendar: icons['calendar'],
  cart: icons['cart'],
  clock: icons['clock'],
  combine: icons['combine'],
  copy: icons['copy'],
  coupon: icons['coupon'],
  dragMove: icons['drag-move'],
  drop: icons['drop'],
  edit: icons['edit'],
  female: icons['female'],
  file: icons['file'],
  filePlus: icons['file-plus'],
  flag: icons['flag'],
  folder: icons['folder'],
  fontColor: icons['font-color'],
  global: icons['global'],
  heading: icons['heading'],
  heart: icons['heart'],
  home1: icons['home-1'],
  home2: icons['home-2'],
  home4: icons['home-4'],
  honour: icons['honour'],
  image: icons['image'],
  information: icons['information'],
  layoutGrid: icons['layout-grid'],
  links: icons['links'],
  lock: icons['lock'],
  mail: icons['mail'],
  mailSend: icons['mail-send'],
  mailUnread: icons['mail-unread'],
  male: icons['male'],
  map: icons['map'],
  mapPin1: icons['map-pin-1'],
  mapPin2: icons['map-pin-2'],
  medal: icons['medal'],
  menu1: icons['menu-1'],
  menu2: icons['menu-2'],
  menu3: icons['menu-3'],
  menuFold: icons['menu-fold'],
  menuUnfold: icons['menu-unfold'],
  message1: icons['message-1'],
  message2: icons['message-2'],
  message3: icons['message-3'],
  monitor: icons['monitor'],
  moreHorizontal: icons['more-horizontal'],
  moreVertical: icons['more-vertical'],
  paperClip: icons['paper-clip'],
  phone: icons['phone'],
  power: icons['power'],
  priceTag: icons['price-tag'],
  qrScan: icons['qr-scan'],
  questionMark: icons['question-mark'],
  reports: icons['reports'],
  search: icons['search'],
  server: icons['server'],
  settings2: icons['settings-2'],
  settingsSlider: icons['settings-slider'],
  shoppingBag: icons['shopping-bag'],
  spacingHeight: icons['spacing-height'],
  spacingWidth: icons['spacing-width'],
  stack: icons['stack'],
  star: icons['star'],
  stickyNote: icons['sticky-note'],
  stock: icons['stock'],
  task: icons['task'],
  text: icons['text'],
  timer: icons['timer'],
  trash: icons['trash'],
  undo: icons['undo'],
  unlock: icons['unlock'],
  user: icons['user'],
  userPlus: icons['user-plus'],
  redo: icons['redo'],
  zoomIn: icons['zoom-in'],
  zoomOut: icons['zoom-out'],
} as const
