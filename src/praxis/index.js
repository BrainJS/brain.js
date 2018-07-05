import MomentumRootMeanSquaredPropagation, {
  MRmsProp,
} from './momentum-root-mean-squared-propagation'

function momentumRootMeanSquaredPropagation(layer, settings) {
  return new MomentumRootMeanSquaredPropagation(layer, settings)
}

const mRmsProp = momentumRootMeanSquaredPropagation
export {
  MomentumRootMeanSquaredPropagation,
  momentumRootMeanSquaredPropagation,
  MRmsProp,
  mRmsProp,
}
