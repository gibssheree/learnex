---
tags: [term, deep-learning, vision]
category: Neural Network Architectures
---

# Convolutional Neural Network (CNN)

**Definition:** A neural network architecture specialized for grid-like data (especially images) that uses small sliding filters (convolutions) to detect local patterns like edges, textures, and shapes.

## How It Works
- Convolutional layers slide learnable filters (kernels) across the input, computing a dot product at each position to produce a feature map that highlights where a given pattern occurs
- Each filter is small (commonly 3x3 or 5x5) but extends through the full depth of the input — a 3x3 filter on a 64-channel input has 3x3x64 weights, not just 9
- Filters are shared across every spatial position, so a "vertical edge detector" learned in the top-left corner also fires in the bottom-right — this weight sharing is what makes CNNs parameter-efficient
- Pooling layers (max or average) downsample feature maps, reducing spatial size while keeping the strongest signals and adding a small amount of translation invariance
- Stacking layers grows the receptive field — each successive layer's neurons "see" a larger region of the original image, letting deep layers combine edges into textures, textures into parts, and parts into objects
- A nonlinearity (almost always ReLU) follows each convolution; without it, stacked convolutions would collapse into a single linear operation
- Late in the network, feature maps are flattened or globally pooled and fed into one or more fully-connected layers that map learned features to class scores
- Multiple filters run in parallel per layer, each learning to detect a different pattern — a layer with 64 filters produces 64 separate feature maps stacked into a 64-channel output volume
- Skip connections (used heavily in ResNet-style architectures) add a layer's input directly to its output, letting the network default to an identity mapping and only learn a residual correction, which keeps gradients flowing cleanly through very deep stacks

## Under the Hood
- Output spatial size for a convolution: `out = floor((W - K + 2P) / S) + 1`, where W is input width, K is kernel size, P is padding, S is stride
- "Valid" padding (P=0) shrinks the feature map every layer; "same" padding pads the input so output size matches input size
- Stride controls how far the filter moves each step — stride 1 preserves resolution, stride 2 halves it (a cheap alternative to pooling)
- Parameter count for a conv layer: `(K_h * K_w * C_in + 1) * C_out` — notice it does NOT depend on the input's spatial dimensions, unlike a fully-connected layer
- 1x1 convolutions ("pointwise" convolutions) don't look at spatial neighbors at all — they mix information across channels and are used to cheaply expand or compress depth (see ResNet bottleneck blocks, Inception modules)
- Depthwise separable convolutions (used in MobileNet) split a standard convolution into a per-channel spatial pass followed by a 1x1 channel-mixing pass, cutting compute by roughly 8-9x with a small accuracy cost
- Dilated (atrous) convolutions insert gaps between kernel elements to grow the receptive field without adding parameters or losing resolution — common in segmentation networks
- Transposed convolutions ("deconvolutions") learn to upsample rather than downsample, used in segmentation decoders and GAN generators
- Global average pooling collapses each feature map to a single number by averaging, replacing large fully-connected classifier heads and cutting millions of parameters (used since GoogLeNet)
- Backprop through a conv layer computes two gradients: the gradient with respect to the input (itself a convolution with the flipped kernel, used to pass error to the previous layer) and the gradient with respect to the filter weights (a correlation between the input and the incoming output gradient, accumulated over every spatial position the filter touched)
- Compute cost is dominated by FLOPs, roughly `2 * K_h * K_w * C_in * C_out * H_out * W_out` per layer — this is why reducing spatial resolution early (via stride or pooling) has an outsized effect on total network compute compared to reducing channel count
- The "effective receptive field" (the region that actually influences a neuron's output in practice) is smaller than the theoretical receptive field computed from stacking layer sizes — center pixels of the receptive field contribute disproportionately, following roughly a Gaussian-shaped weighting
- Skip/residual connections (ResNet) don't just ease optimization — they let each block learn a small residual correction to an identity mapping, which empirically makes very deep stacks behave like an ensemble of shallower paths of varying depth

## Worked Example: Output Size
| Input | Kernel | Stride | Padding | Output |
|---|---|---|---|---|
| 224x224 | 7x7 | 2 | 3 | 112x112 |
| 112x112 | 3x3 | 2 | 1 | 56x56 |
| 56x56 | 3x3 | 1 | 1 | 56x56 (same padding) |
| 32x32 | 5x5 | 1 | 0 | 28x28 (valid padding) |

Applying `out = floor((W - K + 2P) / S) + 1` to the first row: `floor((224 - 7 + 6) / 2) + 1 = floor(223 / 2) + 1 = 111 + 1 = 112`.

## History
- LeNet-5 (LeCun, 1998) — one of the first practical CNNs, recognized handwritten digits for check processing; established the conv-pool-conv-pool-FC pattern
- AlexNet (Krizhevsky et al., 2012) — won ImageNet by a huge margin (top-5 error dropped from ~26% to ~15%), popularizing ReLU, dropout, and GPU training; widely credited with kicking off the deep learning boom
- VGGNet (2014) — showed that stacking many small 3x3 filters outperforms fewer large filters, at the cost of a huge parameter count (~138M)
- GoogLeNet / Inception (2014) — introduced parallel filter sizes per layer ("Inception modules") and 1x1 bottlenecks to go deeper without exploding compute
- ResNet (He et al., 2015) — introduced skip (residual) connections that let gradients flow through 100+ layers without vanishing, making very deep networks trainable; won ImageNet with a 152-layer network
- EfficientNet (2019) — used neural architecture search and "compound scaling" (jointly scaling depth, width, and resolution) to hit strong accuracy at a fraction of the compute of earlier models

## Landmark Architectures at a Glance
| Architecture | Year | Depth | Params | Key Idea |
|---|---|---|---|---|
| LeNet-5 | 1998 | 7 layers | ~60K | Conv + pooling pattern for digit recognition |
| AlexNet | 2012 | 8 layers | ~60M | ReLU, dropout, GPU training at scale |
| VGG-16 | 2014 | 16 layers | ~138M | Uniform small (3x3) filters, stacked deep |
| ResNet-152 | 2015 | 152 layers | ~60M | Residual connections enable extreme depth |
| EfficientNet-B7 | 2019 | Variable | ~66M | Compound scaling of depth/width/resolution |

## Comparison
| | CNN | RNN | Transformer |
|---|---|---|---|
| Core assumption | Local, spatially shared patterns | Sequential order matters | All positions can attend to all others |
| Best suited for | Images, grids, spatial data | Short sequences, streaming data | Long sequences, language, increasingly vision too |
| Parallelizable during training | Yes (fully) | No (sequential dependency) | Yes (fully) |
| Handles long-range dependencies | Weak (needs many layers) | Weak (vanishing gradient over long sequences) | Strong (direct attention to any position) |
| Typical parameter efficiency | High (weight sharing) | Moderate | Low (needs large data/compute to shine) |

See [[Recurrent Neural Network (RNN)]] and [[Vanishing-Exploding Gradient]] for why RNNs struggle with long sequences that CNNs and transformers handle differently.

## Code Example
```python
import torch
import torch.nn as nn

class SimpleCNN(nn.Module):
    def __init__(self, num_classes=10):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=3, padding=1),   # 32 x H x W
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),                                # halves H, W

            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),
        )
        self.classifier = nn.Sequential(
            nn.AdaptiveAvgPool2d(1),   # global average pooling
            nn.Flatten(),
            nn.Linear(64, num_classes),
        )

    def forward(self, x):
        x = self.features(x)
        return self.classifier(x)
```

## Why It Matters
- Dominated computer vision for a decade (ImageNet-winning architectures like ResNet) before Vision Transformers started competing at scale
- Far more parameter-efficient than fully-connected networks for image data, because filters are shared across the whole image instead of learning a separate weight per pixel
- The inductive bias (locality + translation invariance) means CNNs learn useful features from far less data than architectures with weaker assumptions, like plain transformers
- Underpins production systems well beyond photos: medical imaging, satellite analysis, autonomous vehicle perception, industrial defect detection, and audio spectrograms treated as images
- Cheap enough to run on-device (phones, cameras, embedded chips) after quantization/pruning, which matters for latency- and privacy-sensitive applications where sending images to a server isn't acceptable
- The same conv-pool-classify pattern generalizes to 1D (audio waveforms, time series) and 3D (video, volumetric medical scans) data, not just 2D images

## Real-World Applications
- Medical imaging — tumor detection in MRI/CT scans, diabetic retinopathy screening from retinal photos, skin lesion classification
- Autonomous vehicles — lane detection, pedestrian/vehicle detection, traffic sign recognition, often running quantized CNNs on embedded hardware for real-time inference
- Manufacturing quality control — spotting scratches, dents, or misalignments on assembly-line camera feeds faster and more consistently than manual inspection
- Retail and agriculture — shelf inventory counting from store-camera footage, crop disease detection from drone imagery
- Satellite and aerial imagery — land use classification, deforestation tracking, disaster damage assessment
- Optical character recognition (OCR) — reading text in scanned documents or photographed signs, often as a CNN feature extractor feeding a sequence model
- Face verification and biometric security — comparing a live camera feed against a stored embedding for identity confirmation
- Audio classification — spectrograms (2D time-frequency representations of sound) fed into a CNN for tasks like speaker identification or environmental sound detection

## Common Pitfalls
- Using a CNN on data without spatial/local structure (e.g., unordered tabular features), where the architecture's core advantage doesn't apply
- Not using data augmentation (rotations, crops, flips, color jitter), leading to overfitting on limited image datasets
- Ignoring input resolution mismatches — feeding images at a different scale than the network was designed/trained for degrades accuracy
- Forgetting that pooling and strided convolutions discard spatial precision, which hurts tasks like segmentation unless skip connections or upsampling paths recover it
- Treating a pretrained CNN's early layers as needing retraining — low-level filters (edges, colors) transfer well across almost any image domain, so freezing them during [[Transfer Learning]] often works better than fine-tuning from scratch

## Best Practices
- Start from a pretrained backbone (ResNet, EfficientNet) via [[Transfer Learning]] unless you have a very large, domain-specific dataset
- Use batch normalization after convolutions to stabilize and speed up training — see [[Batch Normalization]]
- Match augmentation to the domain: flipping is fine for natural photos, wrong for text-in-image tasks where flipping mirrors characters
- Monitor receptive field size against object size in your data — a network whose final receptive field is smaller than the objects it needs to recognize will underperform regardless of depth
- Quantize or prune a trained CNN before deploying to mobile/embedded hardware — most filters contribute marginally to final accuracy and can be removed or compressed to 8-bit integers with minimal quality loss
- Profile where compute actually goes before optimizing — early high-resolution layers often dominate FLOPs even though they have few channels, so naive "make it smaller" efforts sometimes target the wrong layers

## FAQ
- **Why do CNNs need fewer parameters than a dense network for images?** A dense layer connects every input pixel to every output neuron; a conv layer reuses the same small filter everywhere, so parameter count scales with filter size, not image size.
- **What does "translation invariance" actually buy you?** A cat detector trained on cats in the top-left of images will also fire on cats in the bottom-right, without needing separate examples of every position.
- **Are CNNs obsolete now that Vision Transformers exist?** No — ViTs typically need far more training data or heavy augmentation/distillation to match CNN accuracy at smaller data scales, and CNNs remain cheaper for edge deployment.
- **What's the difference between padding "valid" and "same"?** Valid padding uses no padding and shrinks the output every layer; same padding adds zeros around the border so output spatial size matches input size (for stride 1).
- **Why use 3x3 filters instead of one large 7x7 filter?** Two stacked 3x3 convs cover the same receptive field as one 5x5 conv but with fewer parameters and an extra nonlinearity in between, giving the network more expressive power per parameter.
- **What happens if you remove all pooling layers?** Spatial resolution stays high through the whole network, which is more compute- and memory-intensive but preserves precise spatial information — common in segmentation networks that use strided convolutions instead of pooling for more controllable downsampling.

## Related Terms
- [[Neural Network]]
- [[Recurrent Neural Network (RNN)]]
- [[Batch Normalization]]
- [[Transfer Learning]]
- [[Vanishing-Exploding Gradient]]
- [[Activation Function]]
- [[Regularization (L1, L2, Dropout)]]

## Example
A CNN trained on labeled X-ray images learns to detect pneumonia by recognizing telltale patterns of opacity in lung regions. Early layers learn generic edge and texture detectors; middle layers combine these into structures like rib boundaries and tissue density gradients; the final layers combine those into a diagnosis-relevant representation that a classifier head maps to "pneumonia" or "normal." A radiology team could bootstrap this by fine-tuning a CNN pretrained on ImageNet (natural photos) rather than training from random weights — despite the huge domain gap between photos of dogs and grayscale chest X-rays, the low-level edge/texture filters transfer well enough to cut training time and data requirements substantially.
