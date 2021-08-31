// Preload models. This also makes them colocated in the final bundle for better compression.
import './models/geometries';
import './models/sounds';
import './models/waves';

import { init } from './state';
import './device';
import './intro';
import './ui';
import './game';

init();

import './monetization';
