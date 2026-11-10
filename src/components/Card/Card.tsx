import "./Card.css";

interface Props {
  title: string;
  description: string;
  image?: string;
  tag?: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

export default function Card({
  title,
  description,
  image,
  tag,
  buttonText,
  onButtonClick,
}: Props) {
  return (
    <article className="card">
      {image && <img className="card__image" src={image} alt={title} />}

      <div className="card__body">
        {tag && <span className="card__tag">{tag}</span>}
        <h3 className="card__title">{title}</h3>
        <p className="card__description">{description}</p>

        {buttonText && (
          <button className="card__button" onClick={onButtonClick}>
            {buttonText}
          </button>
        )}
      </div>
    </article>
  );
}