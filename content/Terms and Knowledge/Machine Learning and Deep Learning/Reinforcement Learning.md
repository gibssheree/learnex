---
tags: [term, ml]
category: Core ML Concepts
---

# Reinforcement Learning

**Definition:** A learning paradigm where an agent learns to make decisions by taking actions in an environment and receiving rewards or penalties, aiming to maximize cumulative reward over time.

## How It Works
- Agent observes state → takes action → environment returns reward + new state
- Over many episodes, the agent learns a policy (strategy) that maximizes long-term reward, via methods like Q-learning or policy gradients
- The interaction loop is formalized as a Markov Decision Process (MDP): a tuple of states, actions, transition probabilities, and rewards, where the next state depends only on the current state and action, not the full history
- Because rewards can be delayed, the agent must solve the credit assignment problem — figuring out which of the many actions taken earlier in an episode actually caused a reward received much later
- Training alternates between exploration (trying new actions to discover their value) and exploitation (taking the action currently believed to be best) — an imbalance in either direction stalls learning
- Training happens in episodes (or continuously, for non-episodic tasks) — one episode is a full sequence from an initial state to a terminal state (e.g., one game of chess, one attempt at a level)
- The environment is often only partially observable — the agent's "state" is really an observation that may not capture the full underlying situation, which is what motivates recurrent or memory-augmented policies in harder RL problems

## Under the Hood
- **Policy (π):** a function mapping states to actions (deterministic) or to a probability distribution over actions (stochastic). Learning RL means learning π
- **Value function (V):** the expected cumulative future reward from a state, assuming the agent follows its current policy from there onward
- **Action-value function (Q):** the expected cumulative future reward from taking a specific action in a specific state, then following the policy — this is what Q-learning learns directly
- **Discount factor (gamma):** a number between 0 and 1 that shrinks the weight of future rewards relative to immediate ones; gamma close to 1 makes the agent far-sighted, gamma close to 0 makes it greedy for immediate payoff
- **Bellman equation:** the recursive identity underlying almost all RL algorithms — the value of a state equals the immediate reward plus the discounted value of the next state. Q-learning, value iteration, and TD-learning are all different ways of approximating a solution to this equation
- **Temporal difference (TD) learning:** updates value estimates using the difference between a predicted value and a better bootstrapped estimate one step later, rather than waiting for the full episode to end — this is what makes online, incremental RL possible
- **Advantage function (A):** defined as Q(s,a) minus V(s) — how much better a specific action is than the average action in that state. Used in actor-critic and PPO to reduce the variance of policy updates versus using raw returns
- **Return (G):** the actual discounted sum of rewards observed from a timestep onward during a rollout; the value function is trying to predict the expectation of this quantity before the episode plays out

## Exploration Strategies
- **Epsilon-greedy:** with probability epsilon take a random action, otherwise take the currently best-known action; epsilon is usually annealed from high (mostly explore) to low (mostly exploit) over training
- **Softmax / Boltzmann exploration:** sample actions proportionally to their estimated value passed through a softmax, so better actions are more likely without fully discarding worse ones
- **Upper Confidence Bound (UCB):** favors actions with high estimated value *or* high uncertainty (rarely tried), giving a principled way to explore under-sampled actions
- **Thompson sampling:** maintains a probability distribution over each action's expected reward and samples from it to decide what to try next, naturally balancing exploration and exploitation as uncertainty shrinks
- **Multi-armed bandits:** the simplified special case of RL with a single state and no transitions — only the action-reward relationship matters — used to study exploration/exploitation in isolation and applied directly to A/B testing and ad placement

## Variants
- **Model-free vs. model-based:** model-free agents (Q-learning, policy gradients) learn purely from trial-and-error interaction without ever building an explicit model of the environment's dynamics; model-based agents learn or are given a transition model and can plan ahead by simulating future states
- **Value-based methods:** learn a value or Q-function and derive the policy by acting greedily with respect to it (e.g., Q-learning, Deep Q-Networks/DQN)
- **Policy-gradient methods:** directly parameterize and optimize the policy by gradient ascent on expected reward (e.g., REINFORCE, PPO, TRPO) — better suited to continuous action spaces than value-based methods
- **Actor-critic methods:** hybrid approach where an "actor" network chooses actions and a "critic" network estimates the value function to reduce the variance of the actor's gradient updates (e.g., A2C, A3C, SAC)
- **On-policy vs. off-policy:** on-policy algorithms (SARSA, PPO) can only learn from data generated by the current policy; off-policy algorithms (Q-learning, DQN) can learn from any past experience, including data from older or different policies, which enables experience replay

## Why It Matters
- Distinct from supervised learning — there's no fixed "correct answer" per step, only delayed feedback
- Powers game-playing AI (AlphaGo), robotics control, and RLHF used to align LLMs
- The only major ML paradigm designed for sequential decision-making, where actions affect future opportunities, not just the current prediction
- Underpins recommendation systems that optimize for long-term engagement rather than a single click, and resource allocation problems like ad bidding and datacenter cooling control
- Provides a natural framework for problems with a feedback loop between the model's own decisions and the data it sees next, which supervised learning's static-dataset assumption can't capture
- The mathematical backbone (MDPs, Bellman equations) is shared with classical control theory and operations research, so RL absorbs decades of prior theory on optimal decision-making under uncertainty

## Common Interview Questions
- **What's the difference between value-based and policy-based methods?** Value-based methods learn Q(s,a) or V(s) and derive a policy by acting greedily; policy-based methods directly parameterize and optimize the policy without necessarily learning an explicit value function
- **Why is the Bellman equation important?** It expresses a state's value recursively in terms of immediate reward plus the discounted value of the next state, which is what makes incremental, bootstrapped learning (rather than waiting for full episodes) possible
- **What is the exploration-exploitation tradeoff?** The agent must balance trying new actions to gather information (exploration) against choosing the currently best-known action to maximize reward (exploitation) — too much of either produces a suboptimal policy
- **Why do policy-gradient methods have high variance?** Because they estimate gradients from sampled returns, which are noisy; techniques like baselines, advantage estimation, and larger batches reduce this variance without introducing bias
- **What is experience replay and why does it help?** Storing past transitions in a buffer and sampling randomly from it breaks the correlation between consecutive training samples and lets off-policy algorithms like DQN reuse data multiple times, improving sample efficiency
- **How does AlphaZero differ from AlphaGo?** AlphaGo was pretrained on human expert games before self-play fine-tuning; AlphaZero learns entirely from self-play with no human data, using the same policy/value network plus Monte Carlo tree search architecture for Go, chess, and shogi alike

## History
- Rooted in animal-learning psychology (Pavlov, Thorndike) and formalized mathematically through dynamic programming (Bellman, 1950s) and temporal-difference learning (Sutton, 1980s)
- TD-Gammon (1992) was an early landmark, learning backgammon to near-expert level purely from self-play
- Deep Q-Networks (DeepMind, 2013-2015) combined Q-learning with CNNs to play Atari games directly from pixels, reigniting interest in deep RL
- AlphaGo (2016) and AlphaZero (2017) combined policy/value networks with Monte Carlo tree search to beat world champions at Go, then generalized the same approach to chess and shogi without any human game data
- RLHF (2017 onward, popularized by InstructGPT/ChatGPT) repurposed policy-gradient methods to align language model outputs with human preferences, becoming the dominant post-training step for modern LLMs

## Common Pitfalls
- Reward hacking — the agent finds an unintended shortcut that maximizes reward without achieving the real goal
- Sample inefficiency — RL often needs vastly more trial-and-error than supervised learning to converge
- Reward shaping done carelessly — dense intermediate rewards meant to speed up learning can accidentally teach the wrong behavior if they don't align with the true objective
- Non-stationarity during training — as the policy changes, the distribution of states it visits changes too, which can destabilize learning (especially in multi-agent settings where other agents are also learning)
- High variance in policy-gradient estimates, requiring techniques like baselines, advantage estimation, or larger batch sizes to get a usable signal
- Treating simulation results as directly transferable to the real world ("sim-to-real gap") without accounting for physics or sensor differences
- Poorly designed state/observation representations that omit information the agent actually needs to act well, capping performance regardless of which algorithm is used
- Misjudging the discount factor gamma — too low makes the agent myopic and blind to long-term consequences, too high makes value estimates slow to converge and more sensitive to noise
- Conflating "the agent achieved high reward in training" with "the agent learned the intended behavior" — always inspect rollouts qualitatively, not just the reward curve

## Comparison

| Paradigm | Feedback signal | Goal | Typical use case |
|---|---|---|---|
| Supervised Learning | Correct label per example | Minimize prediction error | Classification, regression |
| Unsupervised Learning | None | Discover structure | Clustering, dimensionality reduction |
| Reinforcement Learning | Scalar reward, often delayed | Maximize cumulative reward | Sequential decision-making, control |
| Self-Supervised Learning | Labels generated from the data itself | Learn representations | Pretraining (e.g., masked language modeling) |

## Code Example
A minimal tabular Q-learning update, the core of value-based RL:

```python
import numpy as np

# Q-table: rows = states, columns = actions
Q = np.zeros((n_states, n_actions))
alpha = 0.1      # learning rate
gamma = 0.95     # discount factor
epsilon = 0.1    # exploration rate

for episode in range(num_episodes):
    state = env.reset()
    done = False
    while not done:
        # epsilon-greedy action selection
        if np.random.rand() < epsilon:
            action = env.action_space.sample()
        else:
            action = np.argmax(Q[state])

        next_state, reward, done, _ = env.step(action)

        # Bellman update
        best_next = np.max(Q[next_state])
        Q[state, action] += alpha * (reward + gamma * best_next - Q[state, action])

        state = next_state
```

## Real-World Example
- **RLHF for LLMs:** models like ChatGPT and Claude are fine-tuned with policy-gradient methods (commonly PPO) against a learned reward model trained on human preference comparisons, steering outputs toward helpful, honest completions without hand-writing rules for every case
- **Datacenter cooling:** DeepMind applied RL to Google's datacenter cooling systems and reported roughly a 40% reduction in cooling energy use, with the agent discovering control policies beyond what human-tuned heuristics had found
- **Recommendation systems:** large platforms have experimented with RL-based recommenders that optimize for long-term watch time or satisfaction rather than a single click, treating each recommendation as one action in a long-running episode
- **Algorithmic trading:** RL agents learn order-execution policies that minimize market impact while filling large orders over time, with reward tied to execution cost rather than a single labeled "correct" trade
- **Robotics and autonomous vehicles:** RL is used for low-level control (balance, grasping) and, combined with simulation, for higher-level planning policies later validated or fine-tuned on real hardware

## Benchmarks & Tools
- **Environments:** OpenAI Gym / Gymnasium (standard API for RL environments), Atari 2600 suite, MuJoCo and PyBullet (continuous control/robotics physics simulation), StarCraft II and Dota 2 (large-scale multi-agent benchmarks)
- **Libraries:** Stable-Baselines3 and RLlib provide tested implementations of DQN, PPO, SAC, and other standard algorithms rather than requiring a from-scratch implementation
- **Standard metrics:** average episodic return, sample efficiency (return per environment step), and wall-clock training time are all tracked separately, since an algorithm can win on one and lose on another
- **Reproducibility challenges:** RL results are notoriously sensitive to random seed, exact hyperparameters, and even library version — published RL benchmarks are harder to reproduce exactly than most supervised learning results

## Comparison Notes
- Supervised and unsupervised learning both assume a static dataset; RL's data distribution depends on the agent's own evolving behavior, which is what makes it inherently non-stationary
- RL is the natural fit whenever the notion of "correct action" doesn't exist in isolation — only a sequence of actions can be judged good or bad, via the cumulative reward they produce

## Best Practices
- Start with the simplest baseline (random policy, tabular Q-learning) to sanity-check the reward function and environment before reaching for deep RL
- Normalize and clip rewards — unbounded reward scales destabilize gradient-based policy updates
- Log episode return and episode length throughout training, not just the loss — RL loss curves are notoriously uninformative on their own
- Use established libraries (Stable-Baselines3, RLlib) for algorithm implementations rather than hand-rolling PPO/DQN — subtle bugs in RL code fail silently as "just needs more training"
- Set a hard evaluation protocol (fixed seeds, frozen policy, no exploration noise) separate from training rollouts, since training-time returns are a noisy and biased estimate of true policy quality
- Shape rewards sparingly and validate that a hand-crafted intermediate reward actually correlates with the true objective before trusting it
- Run multiple seeds for any RL experiment before drawing conclusions — RL training variance across random seeds is notoriously high compared to supervised learning

## FAQ
- **Is RL the same as RLHF?** No — RLHF is a specific application of RL (usually PPO) where the reward signal comes from a model trained to imitate human preference judgments, not from the environment directly
- **Why not just use supervised learning if I have expert demonstrations?** You can (this is called imitation learning / behavior cloning), but it doesn't let the agent discover strategies better than the demonstrator, and it degrades when the agent drifts into states never seen in the demonstrations
- **Does RL need a simulator?** Not strictly, but training directly in the real world is usually too slow, expensive, or unsafe for the number of trials most RL algorithms need
- **What's the difference between RL and a multi-armed bandit?** A bandit has one state and no state transitions — every action is independent of prior ones — while full RL involves states that change based on past actions, requiring the agent to reason about long-term consequences
- **Can RL be combined with supervised learning?** Yes — imitation learning pretrains a policy on expert demonstrations (a supervised step) before refining it with RL, and many RLHF pipelines start from a supervised fine-tuned model rather than a randomly initialized one

## Related Terms
- [[RLHF (Reinforcement Learning from Human Feedback)]]
- [[Supervised Learning]]
- [[Unsupervised Learning]]
- [[Neural Network]]
- [[Gradient Descent]]

## Example
A robot learning to walk by being rewarded for forward progress and penalized for falling, through millions of simulated trial steps. Early in training it flails randomly; over time, the Q-values (or policy weights) shift toward action sequences that reliably produce forward displacement, and the agent converges on a stable gait — without ever being told explicitly what "walking" looks like.
