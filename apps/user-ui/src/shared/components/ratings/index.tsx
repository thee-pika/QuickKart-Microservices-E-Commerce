import StarFilled from 'apps/user-ui/src/app/icons/svgs/filledStar';
import UnFilledStar from 'apps/user-ui/src/app/icons/svgs/unFilledStar';
import React from 'react'

type Props = {
    rating: number
}

const Rating: React.FC<Props> = ({ rating }) => {
    const stars = [];

    for (let i = 0; i < 5; i++) {
        if (i < rating) {
            stars.push(<StarFilled key={`star-${i}`} />)
        } else {
            stars.push(<UnFilledStar key={`star-${i}`} />)
        }
    }
    return <div className="flex items-center gap-1">{stars}</div>;
}

export default Rating;

