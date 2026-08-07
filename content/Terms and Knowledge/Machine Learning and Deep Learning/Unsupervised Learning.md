---
tags: [term, ml]
category: Core ML Concepts
---

# Unsupervised Learning

**Definition:** A machine learning approach where a model finds structure or patterns in data that has no labels — no "correct answer" is provided during training.

## How It Works
- Clustering: group similar data points together (e.g., k-means)
- Dimensionality reduction: compress data into fewer dimensions while preserving structure (e.g., PCA, autoencoders)
- Association: find items that frequently co-occur (e.g., market basket analysis)
- Density estimation: model the underlying probability distribution the data was drawn from, which supports tasks like anomaly detection (points in low-density regions are outliers)
- Representation learning: learn a lower-dimensional or otherwise transformed encoding of the raw input that makes downstream tasks (search, clustering, classification) easier, without any task-specific label guiding the transformation
- Because there's no target label to compute error against, the model instead optimizes an objective defined purely in terms of the data's internal structure — minimizing within-cluster distance, maximizing reconstruction fidelity, or maximizing likelihood under an assumed distribution

## Under the Hood
- **Clustering objective:** k-means minimizes the sum of squared distances between each point and its assigned cluster centroid, alternating between assigning points to the nearest centroid and recomputing centroids until convergence
- **Dimensionality reduction objective:** PCA finds the orthogonal directions (principal components) of maximum variance in the data, projecting high-dimensional data onto the top few components with minimal information loss; an [[Autoencoder]] instead learns a nonlinear compression by training a network to reconstruct its input through a narrow bottleneck layer
- **Density-based methods:** DBSCAN defines clusters as dense regions separated by sparse regions, rather than by distance to a centroid, which lets it find arbitrarily shaped clusters and naturally flag outliers as noise
- **Manifold learning:** methods like t-SNE and UMAP assume high-dimensional data actually lies on (or near) a lower-dimensional manifold, and try to preserve local neighborhood relationships when projecting down to 2 or 3 dimensions for visualization
- **Perplexity and neighbor parameters:** t-SNE's perplexity and UMAP's n_neighbors both control the effective size of the local neighborhood considered when preserving structure — small values emphasize fine local clusters, large values emphasize broader global shape, and results can look qualitatively different across settings on the same data
- Evaluation without labels typically relies on internal metrics — silhouette score, within-cluster sum of squares, reconstruction error — which measure self-consistency, not correctness against ground truth
- **Expectation-Maximization (EM):** the general iterative algorithm behind Gaussian Mixture Models — alternates between estimating the probability each point belongs to each component (expectation) and updating the components' parameters to maximize the likelihood of the data (maximization) until convergence
- Hierarchical clustering builds its tree bottom-up (agglomerative: start with every point as its own cluster, repeatedly merge the closest pair) or top-down (divisive: start with one cluster, repeatedly split), governed by a linkage criterion (single, complete, average, Ward) that defines "distance between clusters"
- PCA's components are the eigenvectors of the data's covariance matrix, ranked by their eigenvalues (the variance explained along that direction) — the top-k eigenvectors give the best possible k-dimensional linear reconstruction of the original data by mean-squared-error

## Contrastive & Self-Supervised Methods
- **Contrastive learning:** trains a model to pull representations of augmented views of the same input together while pushing representations of different inputs apart, without ever using a label — the basis of methods like SimCLR and CLIP's image-text alignment
- **Masked prediction:** hides part of the input (a word, an image patch) and trains the model to reconstruct it from context — the pretraining objective behind BERT and masked autoencoders (MAE)
- **Why it's still "unsupervised":** the supervisory signal is generated automatically from the structure of the unlabeled data itself, not from human-provided labels, which is why this family is more precisely called self-supervised rather than fully label-free unsupervised learning
- **Pretext tasks:** the specific auto-generated prediction problem used to drive representation learning — rotation prediction, colorization, next-token prediction, and jigsaw-puzzle reassembly have all been used as pretext tasks whose real purpose is to force the model to learn useful general features as a byproduct

## Variants
- **Clustering algorithms:** k-means (centroid-based, needs k specified upfront), hierarchical/agglomerative clustering (builds a tree of nested clusters, no need to pre-specify k), DBSCAN and HDBSCAN (density-based, finds arbitrary shapes and outliers), Gaussian Mixture Models (probabilistic, soft cluster assignment), spectral clustering (uses the eigenstructure of a similarity graph, good for non-convex cluster shapes that k-means can't separate)
- **Dimensionality reduction:** PCA (linear, fast, interpretable components), t-SNE (nonlinear, great for visualization, poor for downstream use since it doesn't preserve global distances), UMAP (nonlinear, faster than t-SNE, better preserves global structure), autoencoders (nonlinear, learned, generalizes to new data unlike t-SNE)
- **Anomaly/outlier detection:** isolation forests, one-class SVM, autoencoder reconstruction error — all frame "normal" as high-density or low-reconstruction-error and flag deviations. Isolation forests work by randomly partitioning the feature space and checking how few splits it takes to isolate a point — outliers tend to isolate in fewer splits than typical points
- **Self-supervised learning:** technically a subset of unsupervised learning where labels are automatically generated from the data itself (e.g., predicting a masked word, or whether two augmented image crops came from the same source image) — this has become the dominant way to pretrain large models
- **Association rule learning:** Apriori and FP-Growth algorithms mine frequent itemsets and generate rules like "customers who buy X also buy Y" from transaction data
- **Generative models:** GANs and diffusion models learn the underlying data distribution well enough to sample new, realistic examples from it — an unsupervised objective (model the distribution) with generation as the payoff — see [[GAN (Generative Adversarial Network)]]

## Why It Matters
- Useful when labeled data is scarce or expensive, which is most real-world data
- Powers customer segmentation, anomaly detection, and topic discovery
- Often used as an exploratory first step before building a supervised system — clustering can reveal natural categories in the data that inform what labels are even worth collecting
- Reveals structure a human analyst wouldn't think to look for, since the algorithm isn't biased by preconceived category definitions the way manually designed labels can be
- Cheaper to iterate on than supervised pipelines during early-stage exploration, since there's no labeling budget or annotation turnaround time gating each experiment
- Well suited to problems where the definition of "correct" is inherently fuzzy or evolving (e.g., discovering emerging customer segments) rather than fixed and objectively checkable
- Self-supervised pretraining (a form of unsupervised learning) is what makes today's large language models and vision foundation models possible, since it lets them learn from vastly more data than any labeled dataset could provide
- Scales to essentially unlimited data — since no human labeling effort is required, unsupervised methods can be trained on entire web-scale corpora that would be infeasible to label by hand
- Often surfaces data quality issues (duplicate records, sensor errors, unexpected subpopulations) that a supervised pipeline would silently absorb into its loss without ever flagging them

## Common Interview Questions
- **How does k-means choose its initial centroids, and why does it matter?** Classic k-means picks random points; k-means++ (the scikit-learn default) spreads initial centroids apart probabilistically, which converges faster and more reliably to a good solution than pure random initialization
- **Why does PCA require centering the data first?** PCA finds directions of maximum variance around the mean; without centering, the first "principal component" would partly just capture the offset of the data from the origin rather than its true axis of variation
- **What's the curse of dimensionality, and how does unsupervised learning deal with it?** As dimensionality grows, distance metrics become less meaningful because points become roughly equidistant from each other; dimensionality reduction (PCA, autoencoders) is often applied specifically to mitigate this before clustering
- **When would you choose an autoencoder over PCA?** When the underlying structure in the data is nonlinear — autoencoders can learn curved manifolds that a linear method like PCA cannot represent, at the cost of more compute and less interpretability
- **What does "soft" vs. "hard" clustering mean?** Hard clustering (k-means) assigns each point to exactly one cluster; soft clustering (Gaussian Mixture Models) assigns each point a probability of belonging to each cluster, which is useful when cluster boundaries are genuinely ambiguous

## Common Pitfalls
- No ground truth means evaluating quality is harder and more subjective than in supervised learning
- Choosing the wrong number of clusters/dimensions without validating against domain knowledge
- Feature scale sensitivity — distance-based methods like k-means and DBSCAN are dominated by whichever feature has the largest numeric range unless features are standardized first
- Assuming clusters found in the data correspond to meaningful real-world categories, when they may just reflect noise or an arbitrary artifact of the distance metric chosen
- Misusing t-SNE/UMAP output distances — cluster *sizes* and *inter-cluster distances* in a 2D t-SNE plot are not reliably meaningful, only local neighborhood membership is
- Running k-means on data with non-globular (non-blob-shaped) cluster structure, where it will confidently produce wrong, evenly-sized partitions
- Applying PCA to features with wildly different variances without standardizing first, causing the first principal component to just reflect whichever feature happens to have the largest scale
- Forgetting that k-means is sensitive to centroid initialization — always use multiple random restarts (`n_init` in scikit-learn) since a single run can converge to a poor local optimum
- Treating a low reconstruction error from an autoencoder as proof the compressed representation is "good" for a specific downstream task — reconstruction fidelity and downstream task usefulness are correlated but not the same objective
- Ignoring computational cost at scale — hierarchical clustering is roughly O(n^2) or worse in both time and memory, which becomes impractical well before k-means or DBSCAN hit the same wall
- Interpreting a t-SNE or UMAP plot as if it were a faithful low-dimensional summary of the whole dataset, rather than a visualization optimized specifically to preserve local neighborhoods at the cost of everything else

## Real-World Example
- **Anomaly detection in fraud/security:** models learn the "normal" distribution of transactions or network traffic from unlabeled historical data, then flag new events that fall far outside it — useful because confirmed fraud labels are rare and lag behind emerging fraud patterns
- **Topic discovery:** clustering or topic models (e.g., LDA) group large unlabeled document collections into coherent themes, used for organizing news archives, support tickets, or research literature
- **Image and gene expression compression:** autoencoders compress high-dimensional images or genomic data into compact embeddings that preserve the structure needed for downstream visualization or clustering
- **Pretraining foundation models:** self-supervised objectives (masked language modeling, contrastive image-text alignment) let models like GPT and CLIP learn from web-scale unlabeled data, then get adapted to labeled tasks via [[Transfer Learning]]
- **Market basket analysis:** grocery and e-commerce retailers mine transaction logs with association rule learning to decide product placement and bundle promotions, entirely from purchase co-occurrence patterns with no labels involved

## Comparison

| Method | Learns | Needs k / hyperparameter upfront? | Output | Typical use |
|---|---|---|---|---|
| k-means | Cluster assignments | Yes (k) | Discrete clusters | Customer segmentation |
| Hierarchical clustering | Nested cluster tree | No (choose cut later) | Dendrogram | Taxonomy discovery |
| DBSCAN | Density-based clusters | Yes (epsilon, min points) | Clusters + outliers | Anomaly detection |
| PCA | Linear components | Yes (n components) | Reduced dimensions | Preprocessing, visualization |
| Autoencoder | Nonlinear encoding | Yes (bottleneck size) | Learned embedding | Compression, anomaly detection |

These are not mutually exclusive in practice — a common pipeline reduces dimensionality with PCA or an autoencoder first, then clusters the resulting lower-dimensional embedding, since clustering algorithms tend to perform better and run faster in a compact, denoised feature space.

## Code Example
Clustering and dimensionality reduction with scikit-learn:

```python
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
import numpy as np

# Always scale features before distance-based methods
X_scaled = StandardScaler().fit_transform(X)

# Reduce to 2 dimensions for visualization
X_pca = PCA(n_components=2).fit_transform(X_scaled)

# Cluster into 4 groups
kmeans = KMeans(n_clusters=4, n_init=10, random_state=42)
labels = kmeans.fit_predict(X_scaled)

print("Cluster sizes:", np.bincount(labels))
```

## Best Practices
- Standardize or normalize features before applying any distance-based clustering or PCA — unscaled features silently dominate the result
- Use the elbow method or silhouette score to choose k for k-means rather than picking an arbitrary number
- Visualize clusters (via PCA or UMAP projection) and sanity-check them against domain knowledge before trusting them for a business decision
- Try multiple algorithms — k-means, hierarchical, DBSCAN — since each makes different structural assumptions about the data and can produce meaningfully different results on the same dataset
- Report both the chosen hyperparameters (k, epsilon, number of components) and the sensitivity of the result to reasonable changes in them, so downstream consumers understand how stable the finding is
- Treat unsupervised results as hypotheses to validate, not final answers — pair with a domain expert review or a downstream supervised check when possible
- Fix a random seed and rerun clustering multiple times to check stability — clusters that shift dramatically between runs indicate weak or ambiguous structure in the data
- Document the preprocessing pipeline (scaling method, imputation strategy, dimensionality reduction settings) alongside results, since unsupervised outputs are highly sensitive to these choices and are hard to reproduce otherwise
- Start with a fast, simple method (k-means, PCA) to build intuition about the data before reaching for a more complex approach like a deep autoencoder or UMAP

## FAQ
- **How do I know if my clusters are "good"?** There's no universal answer without labels; use internal metrics (silhouette score) as a sanity check, but ultimately validate against whether the clusters are actionable or interpretable for your use case
- **Is unsupervised learning less useful than supervised learning?** No — it solves a different problem (structure discovery vs. prediction) and is often a necessary precursor to supervised learning when labels don't yet exist
- **What's the difference between unsupervised learning and self-supervised learning?** Self-supervised learning is a subset that manufactures its own "labels" from the input data (e.g., masking part of it and predicting the rest), whereas classic unsupervised learning (clustering, PCA) has no notion of a prediction target at all
- **How do I choose between k-means, hierarchical clustering, and DBSCAN?** Use k-means when clusters are roughly spherical and you have a reasonable guess at k; use hierarchical clustering when you want a full nested taxonomy or don't know k in advance; use DBSCAN when clusters have irregular shapes or you need automatic outlier detection
- **Can I combine clustering with supervised learning?** Yes — cluster IDs or reduced-dimension embeddings are commonly fed into a downstream supervised model as engineered features, or clustering is used to prioritize which unlabeled examples are most worth labeling next
- **Is PCA a form of feature selection?** No — feature selection keeps a subset of the original features unchanged; PCA creates new features (principal components) that are linear combinations of all original features, which makes the results harder to interpret but often more informative per dimension

## Math Notes
- k-means objective: minimize `sum over clusters k, sum over points x in cluster k of ||x - centroid_k||^2` — this is non-convex, so different initializations can converge to different local optima
- PCA reconstruction: projecting onto the top-k components and back gives the best possible rank-k linear approximation of the original data, in the least-squares sense — no other linear method can achieve lower reconstruction error for the same k
- Silhouette score for a point: `(b - a) / max(a, b)`, where `a` is the average distance to points in its own cluster and `b` is the average distance to points in the nearest other cluster; ranges from -1 (likely misclassified) to 1 (well-clustered)
- DBSCAN's two hyperparameters directly define what counts as a cluster: `epsilon` is the neighborhood radius, and `min_samples` is how many neighbors a point needs within that radius to count as a "core point" that can start or extend a cluster

## Terminology Notes
- "Unlabeled" doesn't mean "unstructured" — the data still has features and a distribution; what's missing is a target output for the model to be scored against during training
- Some texts draw a further distinction between unsupervised learning (discovering structure directly, like clustering) and self-supervised learning (manufacturing a supervised-style objective from the data itself) even though both operate on unlabeled data

## Related Terms
- [[Supervised Learning]]
- [[Autoencoder]]
- [[Reinforcement Learning]]
- [[Feature Engineering]]

## Example
Grouping e-commerce customers into segments (e.g., "bargain hunters," "loyal high-spenders") based on purchase behavior, with no predefined labels. A retailer might feed purchase frequency, average order value, and discount sensitivity into k-means; the algorithm partitions customers into groups purely by similarity in that feature space, and the business analyst then interprets and names each resulting cluster after inspecting its characteristics.
